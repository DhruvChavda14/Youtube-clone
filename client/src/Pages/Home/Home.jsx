import React from "react";
import { useSelector } from "react-redux";
import LeftSidebar from "../../Components/LeftSidebar/LeftSidebar";
import ShowVideoGrid from "../../Components/ShowVideoGrid/ShowVideoGrid";

import "./Home.css";

function Home() {
  const vids = useSelector(function (state) {
    return state.videoReducer?.data?.filter(function (q) {
      return q;
    }).reverse();
  });

  const NavList = [
    "All",
    "Python",
    "Java",
    "C++",
    "Movies",
    "Science",
    "Animation",
    "Gaming",
    "Comedy",
  ];

  return (
    <div className="container_Pages_App">
      <LeftSidebar />
      <div className="container2_Pages_App">
        <div className="navigation_Home">
          {NavList.map(function (m) {
            return <p key={m} className="btn_nav_home">{m}</p>;
          })}
        </div>
        <ShowVideoGrid vid={vids} />
      </div>
    </div>
  );
}

export default Home;