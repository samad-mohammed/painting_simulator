import React, { useEffect, useState } from "react";
import { Card, message, Divider } from "antd";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const Profile = ({ apiUrl, myArmyId }) => {
  const [profileData, setProfileData] = useState(null);
  const [imageCount, setImageCount] = useState(0);
  const [passPercentage, setPassPercentage] = useState(0);
  const [error, setError] = useState("");
  const [totalPassedSubmissions, setTotalPassedSubmissions] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("admin")) {
      fetchAdminProfile();
    } else {
      fetchProfileData();
    }
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await axios.get(`${apiUrl}/get_all_student_activity`);
      const { dataList } = response.data;

      if (dataList && dataList.length > 0) {
        const totalStudents = new Set(dataList.map((item) => item.myName)).size;
        const totalSubmissions = dataList.length;
        const passCount = dataList.filter(
          (item) => item.final_result === "Pass"
        ).length;
        // totalPassedSubmissions = passCount;
        const passPercentage =
          totalSubmissions === 1 && passCount === 1
            ? 100
            : (passCount / dataList.length) * 100;

        setProfileData({
          totalStudents,
          totalSubmissions,
          passCount,
          passPercentage,
        });
        setPassPercentage(passPercentage.toFixed(2));
      }
    } catch (error) {
      setError("Error fetching profile data");
      message.error("Error fetching profile data");
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/get_particular_student_activity`,
        {
          params: { myArmyId },
        }
      );
      const { dataList } = response.data;

      if (dataList && dataList.length > 0) {
        setProfileData(dataList[0]);
        setImageCount(dataList.length);
        const passCount = dataList.filter(
          (item) => item.final_result === "Pass"
        ).length;
        setTotalPassedSubmissions(passCount);
        const passPercentage =
          dataList.length === 1 && passCount === 1
            ? 100
            : (passCount / dataList.length) * 100;

        setPassPercentage(passPercentage.toFixed(2));
      }
    } catch (error) {
      setError("Error fetching profile data");
      message.error("Error fetching profile data");
    }
  };

  const data = [
    { name: "Pass", value: parseFloat(passPercentage) },
    { name: "Fail", value: 100 - parseFloat(passPercentage) },
  ];

  const COLORS = ["#0088FE", "#fe0066"];

  return (
    <div className="profile-container">
      {profileData ? (
        <>
          {profileData.totalStudents && profileData.totalSubmissions ? (
            <div className="profile-card">
              <h2 className="profile-username">Admin Profile</h2>
              <p className="profile-details">
                Total Students: {profileData.totalStudents}
              </p>
              <p className="profile-details">
                Total Passed Submissions: {profileData.passCount}
              </p>
              <p className="profile-details">
                Total Submissions: {profileData.totalSubmissions}
              </p>
            </div>
          ) : (
            <div className="profile-card">
              <h2 className="profile-username heading mb-3">
                {profileData.myName || "Username"}
              </h2>
              <p className="profile-details">
                Army ID : {profileData.myArmyId || "N/A"}
              </p>
              <p className="profile-details">
                Batch Number : {profileData.batch_no || "N/A"}
              </p>
              <p className="profile-details">
                Number of Passed Submissions: {totalPassedSubmissions}
              </p>
              <p className="profile-details">
                Total Number of Submissions : {imageCount}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="profile-loading">Loading...</p>
      )}

      {profileData ? (
        <div className="profile-chart">
          <h3 className="profile-chart-title underline">Pass Percentage</h3>
          <PieChart width={600} height={500}>
            <Pie
              data={data}
              cx={300}
              cy={230}
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      ) : null}

      {error && <p className="profile-error">{error}</p>}
    </div>
  );
};

export default Profile;
