#!/bin/bash
if [ "$1" == "DEV" ]; then

(cd ./frontend 
pnpm run dev) &


(cd ./backend 
pnpm run dev)

elif [ "$1" == "PROD" ]; then
(cd ./frontend 
pnpm run build )

(cd ./backend 
pnpm run build)


else
echo "Error: Please specify environment in agrument. (DEV or PROD)"
fi;