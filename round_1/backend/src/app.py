"""
Ultimate Racer Backend - Flask API
Emoji-only racing game backend for turn-based racing mechanics.
"""
import os
import json
import random
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ============================================================================
# TRACK DEFINITION
# The race track is a 24x24 grid of emojis
# ============================================================================

# Track layout - each row is a list of emojis
# Legend:
# 🟩 = Grass (outside track limits, penalty zone)
# ⬛ = Track (valid racing surface)
# 🏁 = Finish line
# 😃 etc = Audience members
TRACK_LAYOUT = [
    list("🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩🟩🟩😃😃🟩🟩🟩🟩🟩🟩🟩🟩😃🤓🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩🟩🟩😃😐🟩🟩🟩🟩🟩🟩🟩🟩😃😃🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩⬛⬛⬛⬛⬛🏁⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛⬛⬛🏁⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛⬛⬛🏁⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛⬛⬛🏁⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩⬛⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩🟩⬛⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛🟩🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛⬛🟩⬛⬛⬛⬛⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩⬛⬛⬛⬛⬛⬛⬛⬛⬛🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩😪😛🤔🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩😃😃😆🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩🫨🫢😯🤔😯😃😃😃😃😃😃😃😃😪😆😎🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩😆😳😯😯😛🤓🤓🤨🤨🤨😃😐😐🫨😆🥸🟩🟩🟩🟩"),
    list("🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩"),
]

# Checkpoint positions (list of cells that form each checkpoint)
# Players must pass through these in order: 1 -> 2 -> 3 -> finish
CHECKPOINTS = {
    1: [(9, 3), (9, 4), (9, 5), (9, 6)],  # Row 9, columns 3-6 (left side going down)
    2: [(16, 8), (17, 8), (18, 8), (19, 8)],  # Rows 16-19, column 8 (bottom curve)
    3: [(9, 17), (9, 18), (9, 19), (9, 20)],  # Row 9, columns 17-20 (right side going up)
}

# Finish line positions
FINISH_LINE = [(4, 9), (5, 9), (6, 9), (7, 9)]

# Starting positions
PLAYER_START = {"x": 8, "y": 7}  # Blue car 🚙
AI_START = {"x": 7, "y": 5}      # Red car 🚗

# Audience emoji set (for detecting audience members)
AUDIENCE_EMOJIS = {"😃", "😐", "🤓", "😪", "😛", "🤔", "🫨", "🫢", "😯", "😆", "😳", "🤨", "😎", "🥸"}
SCARED_EMOJIS = ["😨", "🫨", "😱", "😵", "😵‍💫"]


def get_initial_game_state():
    """Create a fresh game state for a new game."""
    print("[GAME] Creating initial game state")
    
    # Deep copy the track layout
    track = [row[:] for row in TRACK_LAYOUT]
    
    # Store original audience positions for restoration
    original_audience = {}
    for y, row in enumerate(track):
        for x, cell in enumerate(row):
            if cell in AUDIENCE_EMOJIS:
                original_audience[f"{x},{y}"] = cell
    
    state = {
        "track": track,
        "original_audience": original_audience,
        "dead_audience": [],  # List of positions where audience was hit
        "player": {
            "x": PLAYER_START["x"],
            "y": PLAYER_START["y"],
            "vx": 0,
            "vy": 0,
            "checkpoints_passed": [],
            "penalty_turns": 0,
            "finished": False,
            "finish_turn": None,
        },
        "ai": {
            "x": AI_START["x"],
            "y": AI_START["y"],
            "vx": 0,
            "vy": 0,
            "checkpoints_passed": [],
            "penalty_turns": 0,
            "finished": False,
            "finish_turn": None,
        },
        "current_turn": "player",  # player or ai
        "turn_number": 1,
        "game_over": False,
        "winner": None,  # "player", "ai", or "tie"
        "history": {
            "player": [{"x": PLAYER_START["x"], "y": PLAYER_START["y"]}],
            "ai": [{"x": AI_START["x"], "y": AI_START["y"]}],
        },
    }
    
    print(f"[GAME] Initial state created. Player at ({state['player']['x']}, {state['player']['y']}), AI at ({state['ai']['x']}, {state['ai']['y']})")
    return state


def get_valid_moves(state, entity):
    """
    Calculate valid moves for an entity based on current velocity.
    Returns list of {x, y, vx, vy} for each valid move.
    """
    entity_data = state[entity]
    current_x = entity_data["x"]
    current_y = entity_data["y"]
    current_vx = entity_data["vx"]
    current_vy = entity_data["vy"]
    
    print(f"[MOVES] Calculating moves for {entity} at ({current_x}, {current_y}) with velocity ({current_vx}, {current_vy})")
    
    valid_moves = []
    
    # Generate all 9 possible velocity changes (-1, 0, +1 for both x and y)
    for dvx in [-1, 0, 1]:
        for dvy in [-1, 0, 1]:
            new_vx = current_vx + dvx
            new_vy = current_vy + dvy
            new_x = current_x + new_vx
            new_y = current_y + new_vy
            
            # Check if new position is within grid bounds
            if 0 <= new_x < 24 and 0 <= new_y < 24:
                valid_moves.append({
                    "x": new_x,
                    "y": new_y,
                    "vx": new_vx,
                    "vy": new_vy,
                })
    
    print(f"[MOVES] Found {len(valid_moves)} valid moves for {entity}")
    return valid_moves


def check_line_crosses_checkpoint(x1, y1, x2, y2, checkpoint_cells):
    """
    Check if a line from (x1, y1) to (x2, y2) crosses any checkpoint cell.
    Uses Bresenham's line algorithm for pixel-perfect collision.
    """
    # Get all points on the line using Bresenham's algorithm
    points = []
    dx = abs(x2 - x1)
    dy = abs(y2 - y1)
    x, y = x1, y1
    sx = 1 if x1 < x2 else -1
    sy = 1 if y1 < y2 else -1
    
    if dx > dy:
        err = dx / 2
        while x != x2:
            points.append((y, x))  # Note: checkpoint is (row, col) = (y, x)
            err -= dy
            if err < 0:
                y += sy
                err += dx
            x += sx
        points.append((y, x))
    else:
        err = dy / 2
        while y != y2:
            points.append((y, x))
            err -= dx
            if err < 0:
                x += sx
                err += dy
            y += sy
        points.append((y, x))
    
    # Check if any point on the line is in the checkpoint
    for point in points:
        if point in checkpoint_cells:
            return True
    return False


def update_checkpoints(state, entity, old_x, old_y, new_x, new_y):
    """Update checkpoint progress for an entity after a move."""
    entity_data = state[entity]
    checkpoints_passed = entity_data["checkpoints_passed"]
    
    # Determine which checkpoint to check next
    next_checkpoint = len(checkpoints_passed) + 1
    
    if next_checkpoint <= 3:
        checkpoint_cells = CHECKPOINTS[next_checkpoint]
        
        # Check if current position is on checkpoint or line crosses it
        current_on_checkpoint = (new_y, new_x) in checkpoint_cells
        line_crosses = check_line_crosses_checkpoint(old_x, old_y, new_x, new_y, checkpoint_cells)
        
        if current_on_checkpoint or line_crosses:
            checkpoints_passed.append(next_checkpoint)
            print(f"[CHECKPOINT] {entity} passed checkpoint {next_checkpoint}!")
    
    return state


def check_finish(state, entity, old_x, old_y, new_x, new_y):
    """Check if entity has crossed the finish line with all checkpoints passed."""
    entity_data = state[entity]
    
    # Must have passed all 3 checkpoints
    if len(entity_data["checkpoints_passed"]) < 3:
        return False
    
    # Check if on finish line or line crosses it
    current_on_finish = (new_y, new_x) in FINISH_LINE
    line_crosses = check_line_crosses_checkpoint(old_x, old_y, new_x, new_y, FINISH_LINE)
    
    if current_on_finish or line_crosses:
        print(f"[FINISH] {entity} has crossed the finish line!")
        return True
    
    return False


def is_grass_or_audience(cell):
    """Check if a cell is grass or an audience member."""
    return cell == "🟩" or cell in AUDIENCE_EMOJIS or cell == "💀"


def get_cell_type(state, x, y):
    """Get the type of cell at position (x, y)."""
    if x < 0 or x >= 24 or y < 0 or y >= 24:
        return "out_of_bounds"
    
    cell = state["track"][y][x]
    
    if cell == "🟩":
        return "grass"
    elif cell in AUDIENCE_EMOJIS or cell == "💀":
        return "audience"
    elif cell == "🏁":
        return "finish"
    elif cell == "⬛":
        return "track"
    else:
        return "other"


def apply_move(state, entity, move):
    """
    Apply a move to the game state.
    Returns updated state and any penalties incurred.
    """
    entity_data = state[entity]
    other_entity = "ai" if entity == "player" else "player"
    other_data = state[other_entity]
    
    old_x = entity_data["x"]
    old_y = entity_data["y"]
    new_x = move["x"]
    new_y = move["y"]
    
    print(f"[MOVE] {entity} moving from ({old_x}, {old_y}) to ({new_x}, {new_y})")
    
    penalty = False
    penalty_reason = None
    
    # Check for collision with other player
    if new_x == other_data["x"] and new_y == other_data["y"]:
        print(f"[COLLISION] {entity} collided with {other_entity}!")
        penalty = True
        penalty_reason = "collision"
    
    # Check if landing on grass or audience
    cell_type = get_cell_type(state, new_x, new_y)
    if cell_type in ["grass", "audience"]:
        print(f"[PENALTY] {entity} went off track onto {cell_type}!")
        penalty = True
        penalty_reason = cell_type
        
        # If hitting audience, mark them as dead
        if cell_type == "audience":
            state["dead_audience"].append({"x": new_x, "y": new_y})
    
    # Apply penalty if needed
    if penalty:
        entity_data["penalty_turns"] += 1
        entity_data["vx"] = 0
        entity_data["vy"] = 0
        print(f"[PENALTY] {entity} receives 1 turn penalty. Velocity reset to 0.")
    else:
        entity_data["vx"] = move["vx"]
        entity_data["vy"] = move["vy"]
    
    # Update position
    entity_data["x"] = new_x
    entity_data["y"] = new_y
    
    # Add to history
    state["history"][entity].append({"x": new_x, "y": new_y})
    
    # Update checkpoints
    state = update_checkpoints(state, entity, old_x, old_y, new_x, new_y)
    
    # Check for finish
    if check_finish(state, entity, old_x, old_y, new_x, new_y):
        entity_data["finished"] = True
        entity_data["finish_turn"] = state["turn_number"]
        print(f"[FINISH] {entity} finished on turn {state['turn_number']}!")
    
    return state, penalty_reason


def calculate_ai_move(state):
    """
    Calculate the AI's next move.
    Strategy: Accelerate toward next checkpoint, decelerate when close.
    """
    ai_data = state["ai"]
    valid_moves = get_valid_moves(state, "ai")
    
    if not valid_moves:
        print("[AI] No valid moves available!")
        return None
    
    # Determine target based on checkpoints passed
    checkpoints_passed = len(ai_data["checkpoints_passed"])
    
    if checkpoints_passed < 3:
        # Target next checkpoint (center of checkpoint cells)
        next_checkpoint = checkpoints_passed + 1
        checkpoint_cells = CHECKPOINTS[next_checkpoint]
        target_y = sum(c[0] for c in checkpoint_cells) / len(checkpoint_cells)
        target_x = sum(c[1] for c in checkpoint_cells) / len(checkpoint_cells)
        print(f"[AI] Targeting checkpoint {next_checkpoint} at ({target_x:.1f}, {target_y:.1f})")
    else:
        # Target finish line
        target_y = sum(c[0] for c in FINISH_LINE) / len(FINISH_LINE)
        target_x = sum(c[1] for c in FINISH_LINE) / len(FINISH_LINE)
        print(f"[AI] Targeting finish line at ({target_x:.1f}, {target_y:.1f})")
    
    # Calculate distance to target
    current_dist = ((ai_data["x"] - target_x) ** 2 + (ai_data["y"] - target_y) ** 2) ** 0.5
    
    # Score each move
    best_move = None
    best_score = float('-inf')
    
    for move in valid_moves:
        score = 0
        
        # Distance to target after move
        new_dist = ((move["x"] - target_x) ** 2 + (move["y"] - target_y) ** 2) ** 0.5
        
        # Prefer moves that get closer to target
        score += (current_dist - new_dist) * 10
        
        # Check if move lands on penalty zone
        cell_type = get_cell_type(state, move["x"], move["y"])
        if cell_type in ["grass", "audience"]:
            score -= 100  # Heavy penalty for off-track
        
        # Check for collision with player
        if move["x"] == state["player"]["x"] and move["y"] == state["player"]["y"]:
            score -= 50  # Penalty for collision
        
        # If close to target, prefer slower speeds (deceleration)
        if new_dist < 5:
            speed = (move["vx"] ** 2 + move["vy"] ** 2) ** 0.5
            score -= speed * 2  # Prefer lower speed when close
        
        print(f"[AI] Move to ({move['x']}, {move['y']}) score: {score:.2f}")
        
        if score > best_score:
            best_score = score
            best_move = move
    
    print(f"[AI] Selected move to ({best_move['x']}, {best_move['y']}) with score {best_score:.2f}")
    return best_move


def check_game_over(state):
    """Check if the game is over and determine winner."""
    player_finished = state["player"]["finished"]
    ai_finished = state["ai"]["finished"]
    
    # Game isn't over until both have had equal turns after first finish
    if not player_finished and not ai_finished:
        return state
    
    # If only one finished, check if the other can still finish this turn
    if player_finished and not ai_finished:
        if state["current_turn"] == "ai":
            # AI still has a chance this turn
            return state
        else:
            # AI had their chance, player wins
            state["game_over"] = True
            state["winner"] = "player"
            print("[GAME] Player wins!")
    elif ai_finished and not player_finished:
        if state["current_turn"] == "player":
            # Player still has a chance
            return state
        else:
            # Player had their chance, AI wins
            state["game_over"] = True
            state["winner"] = "ai"
            print("[GAME] AI wins!")
    else:
        # Both finished - compare finish turns
        state["game_over"] = True
        if state["player"]["finish_turn"] < state["ai"]["finish_turn"]:
            state["winner"] = "player"
            print("[GAME] Player wins by finishing first!")
        elif state["ai"]["finish_turn"] < state["player"]["finish_turn"]:
            state["winner"] = "ai"
            print("[GAME] AI wins by finishing first!")
        else:
            state["winner"] = "tie"
            print("[GAME] It's a tie!")
    
    return state


def update_audience_reactions(state):
    """Update audience emoji reactions based on car positions."""
    player_x, player_y = state["player"]["x"], state["player"]["y"]
    ai_x, ai_y = state["ai"]["x"], state["ai"]["y"]
    
    for pos, original_emoji in state["original_audience"].items():
        x, y = map(int, pos.split(","))
        
        # Skip if audience member is dead
        if {"x": x, "y": y} in state["dead_audience"]:
            continue
        
        # Calculate distance to both cars
        player_dist = ((x - player_x) ** 2 + (y - player_y) ** 2) ** 0.5
        ai_dist = ((x - ai_x) ** 2 + (y - ai_y) ** 2) ** 0.5
        min_dist = min(player_dist, ai_dist)
        
        # If car is within 3 squares, make audience scared
        if min_dist <= 3:
            state["track"][y][x] = random.choice(SCARED_EMOJIS)
        else:
            state["track"][y][x] = original_emoji
    
    # Mark dead audience
    for dead in state["dead_audience"]:
        state["track"][dead["y"]][dead["x"]] = "💀"
    
    return state


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker healthcheck."""
    print("[API] Health check requested")
    return jsonify({"status": "healthy", "emoji": "🏎️"})


@app.route('/api/game/new', methods=['POST'])
def new_game():
    """Start a new game and return initial state."""
    print("[API] New game requested")
    state = get_initial_game_state()
    state = update_audience_reactions(state)
    return jsonify(state)


@app.route('/api/game/moves', methods=['POST'])
def get_moves():
    """Get valid moves for the current player."""
    state = request.json
    entity = state.get("current_turn", "player")
    
    print(f"[API] Getting moves for {entity}")
    
    # Check if entity has penalty turns
    entity_data = state[entity]
    if entity_data["penalty_turns"] > 0:
        print(f"[API] {entity} has {entity_data['penalty_turns']} penalty turns remaining")
        return jsonify({"moves": [], "penalty": True})
    
    moves = get_valid_moves(state, entity)
    return jsonify({"moves": moves, "penalty": False})


@app.route('/api/game/move', methods=['POST'])
def make_move():
    """Execute a move and return updated game state."""
    data = request.json
    state = data["state"]
    move = data["move"]
    entity = state["current_turn"]
    
    print(f"[API] {entity} making move to ({move['x']}, {move['y']})")
    
    # Check for penalty turns
    if state[entity]["penalty_turns"] > 0:
        state[entity]["penalty_turns"] -= 1
        print(f"[API] {entity} skipping turn due to penalty. {state[entity]['penalty_turns']} turns remaining.")
    else:
        # Apply the move
        state, penalty_reason = apply_move(state, entity, move)
    
    # Update audience reactions
    state = update_audience_reactions(state)
    
    # Check for game over
    state = check_game_over(state)
    
    # Switch turns if game not over
    if not state["game_over"]:
        if entity == "player":
            state["current_turn"] = "ai"
        else:
            state["current_turn"] = "player"
            state["turn_number"] += 1
    
    return jsonify(state)


@app.route('/api/game/ai-move', methods=['POST'])
def ai_move():
    """Calculate and execute AI's move."""
    state = request.json
    
    print("[API] AI calculating move")
    
    # Check for penalty turns
    if state["ai"]["penalty_turns"] > 0:
        state["ai"]["penalty_turns"] -= 1
        print(f"[API] AI skipping turn due to penalty. {state['ai']['penalty_turns']} turns remaining.")
    else:
        move = calculate_ai_move(state)
        if move:
            state, penalty_reason = apply_move(state, "ai", move)
    
    # Update audience reactions
    state = update_audience_reactions(state)
    
    # Check for game over
    state = check_game_over(state)
    
    # Switch to player's turn if game not over
    if not state["game_over"]:
        state["current_turn"] = "player"
        state["turn_number"] += 1
    
    return jsonify(state)


@app.route('/api/track', methods=['GET'])
def get_track():
    """Get the base track layout."""
    print("[API] Track layout requested")
    return jsonify({"track": TRACK_LAYOUT, "checkpoints": CHECKPOINTS, "finish_line": FINISH_LINE})


if __name__ == '__main__':
    print("🚗🚗🚙🚙🏁🏆 Ultimate Racer Backend Starting...")
    app.run(host='0.0.0.0', port=5000, debug=True)

