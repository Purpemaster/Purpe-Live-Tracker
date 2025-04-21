body {
  margin: 0;
  font-family: 'Orbitron', sans-serif;
  background-color: #121212;
  color: #fff;
}

.background {
  position: fixed;
  width: 100%;
  height: 100%;
  background-image: url('dein_pepe_background.png');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.title {
  font-size: 2em;
  margin-bottom: 20px;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.progress-bar {
  width: 100%;
  background-color: #333;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 20px;
  width: 0;
  background: linear-gradient(to right, cyan, magenta);
  transition: width 0.5s ease-in-out;
}

.amounts {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.info-box {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 15px;
  border-radius: 5px;
}

#debug-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-height: 100px;
  overflow: auto;
  background: black;
  color: #0f0;
  font-family: monospace;
  font-size: 11px;
  padding: 5px;
  z-index: 9999;
  opacity: 0.9;
}ü
