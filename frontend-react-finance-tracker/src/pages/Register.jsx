export default function Register() {
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-400">
      <div className="w-[900px] h-[500px] bg-black/70 rounded-lg flex justify-center items-center">
        <div className="bg-yellow-300 w-1/2 flex flex-col justify-between items-start pl-20 gap-5">
          <div>Please Register</div>
          <div className="flex flex-col gap-3">
            <div> First Name & Last Name</div>
            <div>Email</div>
            <div>Password</div>
            <div>Phone Number</div>
            <div>Address</div>
            <div>Keep Me Logged In & Forgot Password</div>
          </div>
          <div>Button Submit</div>
          <div>Google, Github, LinkedIn</div>
        </div>
        <div className="bg-red-500 w-1/2">Gambar</div>
      </div>
    </div>
  );
}

// {
//   "UserId": 1,
//   "firstName": "John",
//   "lastName": "Doe",
//   "email": "john.doe@example.com",
//   "password": "1234567890",
//   "phoneNumber": "081234567890",
//   "address": "Jl. Contoh No. 123, Jakarta"
//   },
