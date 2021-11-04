import { Register, Login } from "./Requests.js";

const getData = () => {
    return {
        email: document.getElementById('mail').value,
        password: document.getElementById('password').value
    }
}

const login = (evt) => {
    evt.preventDefault();
    loginRequest(getData());
}

const signup = (evt) => {
    evt.preventDefault();
    signupRequest(getData());
}

const loginRequest = async({email, password}) => {
    const jsonResponse = await Login.getJson({
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    console.log(jsonResponse.status);
    if(jsonResponse.status !== 200){
        showResponseMsg(jsonResponse.data.msg);
        return;
    }

    window.location.href = "https://localhost:8000/about";
}

const signupRequest = async ({email, password}) => {
    const jsonResponse = await Register.getJson({
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    if(jsonResponse.status !== 201){
        console.log(jsonResponse);
        showResponseMsg(jsonResponse.data.msg);
        return;
    }

    await loginRequest({email, password});
}

const showResponseMsg = (msg) => {
    const info = document.getElementById('info');
    info.innerText = msg;
    info.classList.toggle('text-light');
    info.classList.toggle('text-danger');
}

document.getElementById('login').addEventListener('click',login);
document.getElementById('signup').addEventListener('click',signup);