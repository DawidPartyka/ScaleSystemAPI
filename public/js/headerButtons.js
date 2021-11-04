const check = () =>{
    console.log('checking');
    //window.location = '/getprofiledata';
    fetch('https://localhost:8000/getProfileData',{ redirect: 'follow' })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            }
            else
                return response.json();
        })
        .then(data => console.log(data))
        .catch((err) => {
            console.info(err);
        });
}

const test = async () => {
    const response = await fetch('https://localhost:8000/isauthenticated');

    console.log(await response.json());
}

window.onload = () => {
    document.getElementById('btn-check').addEventListener('click', check);
    document.getElementById('btn-test').addEventListener('click', test);
}