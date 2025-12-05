/**
 * VictoryPopup Component - Shows the podium finish when game ends
 */

interface VictoryPopupProps {
  winner: 'player' | 'ai' | 'tie' | null;
  onRestart: () => void;
}

function VictoryPopup({ winner, onRestart }: VictoryPopupProps) {
  console.log('[VICTORY] Rendering victory popup for winner:', winner);

  // Podium layout based on winner
  // Player = 🚙 (blue car), AI = 🚗 (red car)
  
  if (winner === 'tie') {
    // Tie podium
    return (
      <div className="victory-popup flex flex-col items-center">
        <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 rounded-2xl p-6 backdrop-blur-sm border border-yellow-500/30">
          {/* Tie podium art */}
          <div className="grid gap-0 text-3xl md:text-4xl leading-none">
            <div className="flex justify-center">⬜️⬜️⬜️⬜️⬜️⬜️</div>
            <div className="flex justify-center">⬜️⬜️🏆🏆⬜️⬜️</div>
            <div className="flex justify-center">⬜️🍾🚙🚗🍾⬜️</div>
            <div className="flex justify-center">⬜️⬜️1️⃣1️⃣⬜️⬜️</div>
            <div className="flex justify-center">⬜️2️⃣🟦🟦⬜️⬜️</div>
            <div className="flex justify-center">⬜️🟦🟦🟦3️⃣⬜️</div>
            <div className="flex justify-center">⬜️⬜️⬜️⬜️⬜️⬜️</div>
          </div>
          
          {/* Restart button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onRestart}
              className="restart-button hover:rotate-180 transition-transform duration-500"
            >
              🔄️
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determine podium positions based on winner
  const firstPlace = winner === 'player' ? '🚙' : '🚗';
  const secondPlace = winner === 'player' ? '🚗' : '🚙';

  return (
    <div className="victory-popup flex flex-col items-center">
      <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 rounded-2xl p-6 backdrop-blur-sm border border-yellow-500/30">
        {/* Winner podium art */}
        <div className="grid gap-0 text-3xl md:text-4xl leading-none">
          <div className="flex justify-center">⬜️⬜️⬜️⬜️⬜️</div>
          <div className="flex justify-center">⬜️⬜️🏆⬜️⬜️</div>
          <div className="flex justify-center">⬜️⬜️{firstPlace}🍾⬜️</div>
          <div className="flex justify-center">⬜️{secondPlace}1️⃣⬜️⬜️</div>
          <div className="flex justify-center">⬜️2️⃣🟦⬜️⬜️</div>
          <div className="flex justify-center">⬜️🟦🟦3️⃣⬜️</div>
          <div className="flex justify-center">⬜️⬜️⬜️⬜️⬜️</div>
        </div>
        
        {/* Restart button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onRestart}
            className="restart-button hover:rotate-180 transition-transform duration-500"
          >
            🔄️
          </button>
        </div>
      </div>
    </div>
  );
}

export default VictoryPopup;

