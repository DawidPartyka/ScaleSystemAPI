const deleteScale = async(id) => {
    const url = 'https://localhost:8000/scale/deletebyid/';

    const rawResponse = await fetch(url + id, {
        method: 'DELETE'
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    if(response.status !== 200)
        alert(`Something went wrong.\n${JSON.stringify(jsonResponse)}`);
    else
        location.reload();
}