cd ./backend
npm install
npm run build

cd ../frontend
npm install
npm run build

cd ../backend
mv ../frontend/dist/* ./client
