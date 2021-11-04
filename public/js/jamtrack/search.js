import { createDomElement } from "../utils/utils.js";

const searchScale = async(event) => {
    const url = 'https://localhost:8000/jamtrack/search/';

    event.preventDefault();

    const search = document.getElementById('jamtrackSearchInput').value;

    if(!search){
        alert('Fill search phrase before sending');

        return;
    }

    const rawResponse = await fetch(url + search);

    const response = await rawResponse;
    const jsonResponse = await response.json();

    console.log(jsonResponse);
    if(response.status !== 200){
        let msg = 'Sorry. Something went wrong';

        if(response.status === 404)
            msg += '\nNo jamtrack matches your phrase';

        msg += `\nStatus: ${response.status}`;

        alert(msg);

        document.getElementById('scaleSearch').reset();

        return;
    }

    const list = document.getElementById('jamtrackList');
    list.innerHTML = "";

    const createCol = () => createDomElement('div', ['col']);
    const createInfoCol = (title, value) => {
        const col = createCol();
        col.appendChild(createDomElement('p', ['text-info'], `${title}: ${value}`));
        return col;
    }

    jsonResponse.response.forEach((entry) => {
        const li = createDomElement('li', ['list-group-item']);
        const row = createDomElement('div', ['row']);

        row.appendChild(createInfoCol('Name', entry.name));

        row.appendChild(createInfoCol('BPM', entry.bpm));

        row.appendChild(createInfoCol('Length', entry.duration));

        row.appendChild(createInfoCol('Created at', entry.createdAt));

        const playButton = createDomElement('button', ['btn', 'btn-primary'], 'Play');
        playButton.setAttribute("onclick",`play('${entry.id}', '${entry.ext}')`);
        const col1 = createCol();
        col1.appendChild(playButton);
        row.appendChild(col1);

        const href = createDomElement('a');
        href.setAttribute('href', 'https://localhost:8000/user/playFretboard/' + entry.id);
        const playFretboardButton = createDomElement('button', ['btn', 'btn-primary'], 'Play with fretboard');
        href.appendChild(playFretboardButton);
        const col2 = createCol();
        col2.appendChild(href);
        row.appendChild(col2);

        li.appendChild(row);
        list.appendChild(li);
    });
}

window.addEventListener('load', () => {
    document.getElementById('submitJamtrackSearch').addEventListener('click', searchScale);
});