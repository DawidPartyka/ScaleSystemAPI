const checkLogs = async () => {
    const url = 'https://localhost:8000/user/getlogs';

    const dateStart = document.getElementById('date-start').value;
    const dateEnd = document.getElementById('date-end').value;

    if(!dateStart || !dateEnd){
        alert('Select date range to check logs');
        return;
    }

    const response = await fetch(`${url}/${dateStart}/${dateEnd}`);

    console.log(await response.json());
}

window.onload = () => {
    document.getElementById('date-submit').addEventListener('click', checkLogs);
}