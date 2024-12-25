using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend_dotnet.Models
{
    public class Users
    {
        public int id { get; set; }
        [Required]
        public string username { get; set; }
        [Required]
        [EmailAddress]
        public required string email { get; set; }
        [Required]
        [DataType(DataType.Password)]
        public required string password { get; set; }

    }
}