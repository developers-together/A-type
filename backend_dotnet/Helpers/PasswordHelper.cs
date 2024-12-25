using System.Security.Cryptography;
using System.Text;

namespace backend_dotnet.Helpers
{
    public static class PasswordHelper
    {
        /// <summary>
        /// Hashes the password using SHA256.
        /// </summary>
        /// <param name="password">The plain text password.</param>
        /// <returns>The hashed password as a Base64 string.</returns>
        public static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }


        public static bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }
    }
}
