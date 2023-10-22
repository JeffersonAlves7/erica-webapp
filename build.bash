cd ./backend
npm install
npm run build

cd ../frontend
npm install
npm run build

cd ../backend
rm -rf ./client/*
mv ../frontend/dist/* ./client
