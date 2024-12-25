using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend_dotnet.Models;

namespace backend_dotnet.Data
{
     public class AtypeDbContext : DbContext
    {
        public AtypeDbContext (DbContextOptions<AtypeDbContext> options)
            : base(options)
        {
        }

        public DbSet<backend_dotnet.Models.Users> Users { get; set; } = default!;
    }
    
}
   
