const express = require('express');
const ytdl = require('ytdl-core');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/getQualities', async (req, res) => {
    const videoUrl = req.query.url;

    try {
        if (!ytdl.validateURL(videoUrl)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        const info = await ytdl.getInfo(videoUrl);
        const formats = info.formats.filter((format) => format.container === 'mp4');
        const qualityLabels = formats.map((format) => format.qualityLabel);
        res.json(qualityLabels);
    } catch (error) {
        console.error('Error fetching quality options:', error);
        res.status(500).json({ error: 'Error fetching quality options' });
    }
});

const qualityLabelsToItags = {
    'highest': 'highest',
    'lowest': 'lowest',
    'audio': 'audioonly', 
    '2160p (4k)': '313', 
    '1440p (2k)': '271', 
    '1080p (Full HD)': '137', 
    '720p (HD)': '22', 
    '480p': '135', 
    '360p': '18', 
    '240p': '133', 
    '144p': '160', 
};


app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    const selectedType = req.query.type;
    const selectedQualityLabel = req.query.quality;

    try {
        const info = await ytdl.getInfo(videoUrl);
        const videoTitle = info.videoDetails.title;

        if (selectedType === 'audio') {
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
           
            const videoFormats = info.formats.filter((format) => format.hasVideo && format.hasAudio);
            const selectedFormat = videoFormats.find((format) => format.qualityLabel === selectedQualityLabel);

            if (selectedFormat) {
                res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
                ytdl(videoUrl, { format: selectedFormat })
                    .pipe(res)
                    .on('finish', () => {
                        console.log('Video download finished');
                    });
            } else {
                res.status(400).send('No matching video format found with both video and audio.');
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