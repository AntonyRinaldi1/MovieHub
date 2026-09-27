import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const demoAccounts = {
  admin: { password: "admin123", role: "admin", name: "Administrator" },
  "admincinemanage@gmail.com": { password: "admin123", role: "admin", name: "Administrator", email: "admincinemanage@gmail.com" },
  user: { password: "user123", role: "user", name: "Movie Fan" }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("moviehub_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (identifier, password) => {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const registeredUsers = JSON.parse(localStorage.getItem("moviehub_users") || "[]");
    const account = demoAccounts[normalizedIdentifier] || registeredUsers.find((user) => user.email === normalizedIdentifier);
    if (!account || account.password !== password) return false;

    const user = { username: account.email || normalizedIdentifier, email: account.email, role: account.role, name: account.name };
    localStorage.setItem("moviehub_user", JSON.stringify(user));
    setCurrentUser(user);
    return true;
  };

  const register = (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const registeredUsers = JSON.parse(localStorage.getItem("moviehub_users") || "[]");
    const exists = registeredUsers.some((user) => user.email === normalizedEmail);

    if (exists || demoAccounts[normalizedEmail]) return false;

    const user = { name: name.trim(), email: normalizedEmail, password, role: "user", profilePic: "", moviesReviewed: 0 };
    localStorage.setItem("moviehub_users", JSON.stringify([...registeredUsers, user]));
    return true;
  };

  const updateProfile = (changes) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...changes };
    localStorage.setItem("moviehub_user", JSON.stringify(updatedUser));

    if (updatedUser.email) {
      const registeredUsers = JSON.parse(localStorage.getItem("moviehub_users") || "[]");
      const updatedUsers = registeredUsers.map((user) => user.email === updatedUser.email
        ? { ...user, ...changes }
        : user
      );
      localStorage.setItem("moviehub_users", JSON.stringify(updatedUsers));
    }

    setCurrentUser(updatedUser);
  };

  const recordMovieReview = () => {
    if (!currentUser) return;
    updateProfile({ moviesReviewed: Number(currentUser.moviesReviewed || 0) + 1 });
  };

  const getReviewerRank = () => {
    if (!currentUser) return null;
    const registeredUsers = JSON.parse(localStorage.getItem("moviehub_users") || "[]");
    const users = registeredUsers.some((user) => user.email === currentUser.email)
      ? registeredUsers
      : [...registeredUsers, currentUser];
    const rankedUsers = users.sort((firstUser, secondUser) => (
      Number(secondUser.moviesReviewed || 0) - Number(firstUser.moviesReviewed || 0)
    ));
    const currentIndex = rankedUsers.findIndex((user) => (
      currentUser.email ? user.email === currentUser.email : user.username === currentUser.username
    ));
    return currentIndex === -1 ? null : currentIndex + 1;
  };

  const logout = () => {
    localStorage.removeItem("moviehub_user");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, updateProfile, recordMovieReview, getReviewerRank, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}