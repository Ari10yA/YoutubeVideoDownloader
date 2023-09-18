document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-btn');
    const urlInput = document.getElementById('url');
    const typeSelect = document.getElementById('type');
    const qualitySelect = document.getElementById('quality');
    const downloadLink = document.getElementById('download-link');
    const downloadLinkA = document.getElementById('download-link-a');
    const errorMessage = document.getElementById('error-message');

    async function updateQualityOptions() {
        const selectedType = typeSelect.value;
        const videoUrl = urlInput.value;
    
        if (videoUrl.trim() === '') {
            return;
        }
    
        try {
            const response = await fetch(`/getQualities?url=${videoUrl}`);
            if (response.ok) {
                const qualityOptions = await response.json();
                qualitySelect.innerHTML = '';
    
                qualityOptions.forEach((quality) => {
                    const option = document.createElement('option');
                    option.value = quality;
                    option.textContent = quality;
                    qualitySelect.appendChild(option);
                });
            } else {
                errorMessage.textContent = 'Error fetching quality options.';
            }
        } catch (error) {
            console.error('Error fetching quality options:', error);
            qualitySelect.innerHTML = '';
        }
    }

    typeSelect.addEventListener('change', updateQualityOptions);
    urlInput.addEventListener('input', updateQualityOptions);

    downloadBtn.addEventListener('click', async () => {
        const videoUrl = urlInput.value;
        const selectedType = typeSelect.value;
        const selectedQuality = qualitySelect.value;

        try {
            const response = await fetch(`/download?url=${videoUrl}&type=${selectedType}&quality=${selectedQuality}`);
            if (response.ok) {
                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);

                downloadLinkA.href = objectURL;
                downloadLinkA.style.display = 'block';
                downloadLinkA.download = `${videoUrl}.${selectedType === 'video' ? 'mp4' : 'mp3'}`;

                errorMessage.textContent = '';
            } else {
                errorMessage.textContent = 'Error downloading the file.';
            }
        } catch (error) {
            errorMessage.textContent = 'Error processing the request.';
        }
    });

    updateQualityOptions();
});