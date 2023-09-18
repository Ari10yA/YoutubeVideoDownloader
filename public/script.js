document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-btn');
    const urlInput = document.getElementById('url');
    const qualitySelect = document.getElementById('quality');
    const downloadLink = document.getElementById('download-link');
    const downloadLinkA = document.getElementById('download-link-a');
    const errorMessage = document.getElementById('error-message');

    downloadBtn.addEventListener('click', async () => {
        const videoUrl = urlInput.value;
        const selectedQuality = qualitySelect.value;

        try {
            const response = await fetch(`/download?url=${videoUrl}&quality=${selectedQuality}`);
            if (response.ok) {
                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);

                downloadLinkA.href = objectURL;
                downloadLinkA.style.display = 'block';
                downloadLinkA.download = `${videoUrl}.${selectedQuality === 'audio' ? 'mp3' : 'mp4'}`;

                errorMessage.textContent = '';
            } else {
                errorMessage.textContent = 'Error downloading the file.';
            }
        } catch (error) {
            errorMessage.textContent = 'Error processing the request.';
        }
    });
});