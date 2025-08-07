echo "Running pnpm install on frontend"

cd ./frontend
pnpm install

echo "Frontend packages installed"

cd ../backend

pnpm install

echo "Backend packages install"
echo "Install complete"