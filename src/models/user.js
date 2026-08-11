class User {
  constructor({
    first_name,
    last_name,
    email,
    password,
    role = "user"
  }) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.password = password;
    this.role = role;
  }
}

export default User;