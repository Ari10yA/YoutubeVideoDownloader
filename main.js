
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Map quality options to corresponding itag values
const qualityOptions = {
    highest: 'highest',
    lowest: 'lowest',
    '720p': '22', // Video - 720p
    '360p': '18', // Video - 360p
    audio: 'audioonly', // Audio (MP3)
};

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    const selectedQuality = req.query.quality;

    try {
        const info = await ytdl.getInfo(videoUrl);

        if (selectedQuality === 'audio') {
            const videoTitle = info.videoDetails.title;

            const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });

            if (audioFormat) {
                res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp3"`);
                ytdl(videoUrl, { format: audioFormat })
                    .pipe(res)
                    .on('finish', () => {
                        console.log('Audio download finished');
                    });
            } else {
                res.status(400).send('No matching audio format found.');
            }
        } else {
            const itag = qualityOptions[selectedQuality];
            const videoTitle = info.videoDetails.title;

            const videoFormat = ytdl.chooseFormat(info.formats, { quality: itag });

            if (videoFormat) {
                res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
                ytdl(videoUrl, { format: videoFormat })
                    .pipe(res)
                    .on('finish', () => {
                        console.log('Video download finished');
                    });
            } else {
                res.status(400).send('No matching video format found.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing the request.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



