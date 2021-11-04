import { PostRequest } from "./Request.js";

export const Login = new PostRequest({endpoint: 'user/login'});
export const Register = new PostRequest({endpoint: 'user/register'});