import GameCanvas from '../components/GameCanvas';

export default function GamePage() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        background: '#0a0a1a',
      }}
    >
      <GameCanvas />
    </div>
  );
}
