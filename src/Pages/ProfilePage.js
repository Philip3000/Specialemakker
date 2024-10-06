import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Ensure this imports Firestore correctly

const ProfilePage = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setProfileData(userDoc.data());
      } else {
        console.error("No such user!");
      }
    };
    fetchProfile();
  }, [userId]);

  if (!profileData) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profileData.name}</h1>
      <p>Email: {profileData.email}</p>
      <p>Phone: {profileData.phone}</p>
      <p>Field of Study: {profileData.fieldOfStudy}</p>
      <p>University: {profileData.universityName}</p>
    </div>
  );
};

export default ProfilePage;
