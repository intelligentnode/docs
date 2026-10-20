#!/bin/zsh
# usage: finish.sh v1|v2  -> out/<v>_final.mp4 under 10 MB
v=$1; cd "$(dirname $0)/out"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 ${v}_video.mp4)
ffmpeg -v error -y -i ${v}_mix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -ac 2 -c:a aac -b:a 128k ${v}_audio.m4a
vb=$(python3 -c "print(int((9.3*8*1024*1024/$dur - 135000)/1000))")
ffmpeg -v error -y -i ${v}_video.mp4 -c:v libx264 -preset slow -b:v ${vb}k -pass 1 -passlogfile ${v}_pass -an -f mp4 /dev/null
ffmpeg -v error -y -i ${v}_video.mp4 -i ${v}_audio.m4a -c:v libx264 -preset slow -b:v ${vb}k -pass 2 -passlogfile ${v}_pass -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy -shortest ${v}_final.mp4
ls -l ${v}_final.mp4; echo "video kbps $vb"
