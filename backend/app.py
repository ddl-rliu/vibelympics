"""
Flaming Hot Auditor - Backend API
A Flask application that interfaces with the OSV API to retrieve package vulnerability data.
"""

import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# OSV API endpoint
OSV_API_URL = "https://api.osv.dev/v1/query"


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    logger.info("Health check requested")
    return jsonify({"status": "healthy", "service": "flaming-hot-auditor"})


@app.route('/api/audit', methods=['POST'])
def audit_package():
    """
    Audit a package for vulnerabilities using the OSV API.
    
    Expected payload:
    {
        "ecosystem": "PyPI" | "npm" | "Maven" | "Go",
        "name": "package-name"
    }
    
    Note: Version is NOT included in OSV query - we fetch all vulnerabilities
    and let the frontend filter by version.
    """
    try:
        data = request.get_json()
        
        if not data:
            logger.error("No JSON payload provided")
            return jsonify({"error": "No JSON payload provided"}), 400
        
        ecosystem = data.get('ecosystem')
        package_name = data.get('name')
        
        if not ecosystem or not package_name:
            logger.error(f"Missing required fields. ecosystem: {ecosystem}, name: {package_name}")
            return jsonify({"error": "Both 'ecosystem' and 'name' are required"}), 400
        
        logger.info(f"Auditing package: {ecosystem}/{package_name}")
        
        # Construct OSV API payload - note: no version field
        osv_payload = {
            "package": {
                "ecosystem": ecosystem,
                "name": package_name
            }
        }
        
        logger.debug(f"OSV API payload: {osv_payload}")
        
        # Make request to OSV API
        response = requests.post(OSV_API_URL, json=osv_payload, timeout=30)
        response.raise_for_status()
        
        osv_data = response.json()
        logger.info(f"OSV API returned {len(osv_data.get('vulns', []))} vulnerabilities")
        
        # Process the response to extract version information and check for malicious packages
        vulnerabilities = osv_data.get('vulns', [])
        
        # Check if any vulnerability indicates a malicious package
        is_malicious = False
        malicious_details = None
        
        for vuln in vulnerabilities:
            vuln_id = vuln.get('id', '')
            summary = vuln.get('summary', '')
            details = vuln.get('details', '')
            
            # Check for malicious package indicators:
            # 1. ID starts with "MAL-" (OSV malicious package prefix)
            # 2. Summary or details contain "malicious"
            # 3. Source indicates malicious-packages-origins
            
            if vuln_id.startswith('MAL-'):
                is_malicious = True
                malicious_details = {
                    "id": vuln_id,
                    "summary": summary or 'Malicious package detected',
                    "details": details
                }
                logger.warning(f"Malicious package detected via MAL- prefix: {vuln_id}")
                break
            
            if 'malicious' in summary.lower() or 'malicious' in details.lower():
                is_malicious = True
                malicious_details = {
                    "id": vuln_id,
                    "summary": summary or 'Malicious package detected',
                    "details": details
                }
                logger.warning(f"Malicious package detected via summary/details: {vuln_id}")
                break
            
            # Check database_specific source
            database_specific = vuln.get('database_specific', {})
            source = database_specific.get('source', '')
            
            if source and 'malicious-packages' in source.lower():
                is_malicious = True
                malicious_details = {
                    "id": vuln_id,
                    "summary": summary or 'Malicious package detected',
                    "details": details
                }
                logger.warning(f"Malicious package detected via source: {vuln_id}")
                break
            
            # Check credits for malicious package indicators (e.g., Checkmarx)
            credits = vuln.get('credits', [])
            for credit in credits:
                contact = credit.get('contact', [])
                if any('malicious' in str(c).lower() for c in contact):
                    is_malicious = True
                    malicious_details = {
                        "id": vuln_id,
                        "summary": summary or 'Malicious package detected',
                        "details": details
                    }
                    logger.warning(f"Malicious package detected via credits: {vuln_id}")
                    break
            if is_malicious:
                break
        
        # Extract all affected versions from vulnerabilities
        versions_set = set()
        version_vulns = {}  # Map version to its vulnerabilities
        
        for vuln in vulnerabilities:
            affected_list = vuln.get('affected', [])
            for affected in affected_list:
                # Get package info to match ecosystem
                pkg = affected.get('package', {})
                if pkg.get('ecosystem') != ecosystem:
                    continue
                
                # Extract versions from ranges
                ranges = affected.get('ranges', [])
                for range_info in ranges:
                    events = range_info.get('events', [])
                    for event in events:
                        if 'introduced' in event:
                            v = event['introduced']
                            if v and v != '0':
                                versions_set.add(v)
                        if 'fixed' in event:
                            v = event['fixed']
                            if v:
                                versions_set.add(v)
                
                # Also get explicitly listed versions
                explicit_versions = affected.get('versions', [])
                for v in explicit_versions:
                    versions_set.add(v)
                    if v not in version_vulns:
                        version_vulns[v] = []
                    version_vulns[v].append(vuln)
        
        # Process vulnerabilities with severity information
        processed_vulns = []
        for vuln in vulnerabilities:
            severity = "UNKNOWN"
            score = None
            
            # Try to get severity from database_specific
            db_specific = vuln.get('database_specific', {})
            if 'severity' in db_specific:
                severity = db_specific['severity']
            
            # Try to get from severity array
            severity_list = vuln.get('severity', [])
            for sev in severity_list:
                if sev.get('type') == 'CVSS_V3':
                    score_str = sev.get('score', '')
                    # Parse CVSS score
                    if score_str:
                        try:
                            # CVSS scores are typically in format like "CVSS:3.1/AV:N/AC:L/..."
                            # or just a number
                            if '/' in score_str:
                                # Try to find the base score
                                parts = score_str.split('/')
                                for part in parts:
                                    try:
                                        score = float(part)
                                        break
                                    except ValueError:
                                        continue
                            else:
                                score = float(score_str)
                        except ValueError:
                            pass
                    
                    # Determine severity from score
                    if score:
                        if score >= 9.0:
                            severity = "CRITICAL"
                        elif score >= 7.0:
                            severity = "HIGH"
                        elif score >= 4.0:
                            severity = "MODERATE"
                        else:
                            severity = "LOW"
            
            # Get affected versions for this vuln
            affected_versions = []
            introduced_version = None
            fixed_version = None
            
            for affected in vuln.get('affected', []):
                pkg = affected.get('package', {})
                if pkg.get('ecosystem') == ecosystem and pkg.get('name') == package_name:
                    affected_versions.extend(affected.get('versions', []))
                    
                    for range_info in affected.get('ranges', []):
                        for event in range_info.get('events', []):
                            if 'introduced' in event:
                                introduced_version = event['introduced']
                            if 'fixed' in event:
                                fixed_version = event['fixed']
            
            processed_vulns.append({
                "id": vuln.get('id'),
                "summary": vuln.get('summary', 'No summary available'),
                "details": vuln.get('details', ''),
                "severity": severity,
                "score": score,
                "references": vuln.get('references', []),
                "affected_versions": affected_versions,
                "introduced": introduced_version,
                "fixed": fixed_version,
                "aliases": vuln.get('aliases', []),
                "credits": vuln.get('credits', [])
            })
        
        result = {
            "package": {
                "ecosystem": ecosystem,
                "name": package_name
            },
            "versions": sorted(list(versions_set)),
            "vulnerabilities": processed_vulns,
            "is_malicious": is_malicious,
            "malicious_details": malicious_details,
            "total_vulnerabilities": len(processed_vulns)
        }
        
        logger.info(f"Returning {len(processed_vulns)} processed vulnerabilities for {ecosystem}/{package_name}")
        return jsonify(result)
        
    except requests.exceptions.Timeout:
        logger.error("OSV API request timed out")
        return jsonify({"error": "Request to OSV API timed out"}), 504
    except requests.exceptions.RequestException as e:
        logger.error(f"OSV API request failed: {str(e)}")
        return jsonify({"error": f"Failed to query OSV API: {str(e)}"}), 502
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    
    logger.info(f"Starting Flaming Hot Auditor backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)

