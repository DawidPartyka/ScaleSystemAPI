const postCoverData = async function (event){
    event.preventDefault();

    const fileInput = document.getElementById('formFileCover');
    const jamtrackId = document.getElementById('jamtrackCoverAddId').value;
    const url = 'https://localhost:8000/jamtrack/coverUpload';

    if(!fileInput.files.length) {
        alert('No file selected');
        return;
    }

    if(!jamtrackId.length){
        alert('No jamtrack selected');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();

    formData.append('file', file);
    formData.append('jamtrackId', jamtrackId);

    const post = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const response = await post;
    const responseJson = await response.json();
    document.getElementById('addJamtrackCoverStatus').innerText = response.status;
    document.getElementById('addJamtrackCoverResponse').innerText = JSON.stringify(responseJson, null, 2);
    document.getElementById('addJamtrackCoverForm').reset();
}

window.addEventListener('load', () => {
    document.getElementById('submitAddJamtrackCover')
        .addEventListener('click', postCoverData);
});