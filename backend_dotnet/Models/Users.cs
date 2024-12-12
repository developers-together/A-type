using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_dotnet.Models
{
    public class Users
    {
        public int id { get; set; }
        public string username { get; set; }
        [DataType(DataType.EmailAddress)]
        public string email { get; set; } // Add semicolon here
        [DataType(DataType.Password)]
        public string password { get; set; } // Add semicolon here
    }
}