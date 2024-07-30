import * as api from "../api";
import { setCurrentUser } from "./currentUser";
export const login = (authData) => async (dispatch) => {
  try {
    console.log(authData);
    const { data } = await api.login(authData);
    dispatch({ type: "AUTH", data });
    dispatch(setCurrentUser(JSON.parse(localStorage.getItem('Profile'))))
  } catch (error) {
    alert(error);
  }
};

export const fetchCurrentUser = () => async (dispatch) => {
  try {
    const response = await api.fetchCurrentUser(); 
    const userData = {
      email: response.data.email,
      points: response.data.points 
    };
    console.log(userData.points)
    dispatch(setCurrentUser(userData));
  } catch (error) {
    console.error('Error fetching current user:', error);
  }
};
