using Microsoft.AspNetCore.Mvc;
using backend_dotnet.Models;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Http;
using System;

namespace backend_dotnet.Controllers
{
    public class LoginController : Controller
    {
        private readonly AtypeDbContext _context;

        public LoginController(AtypeDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(Users user)
        {
            if (user == null || string.IsNullOrEmpty(user.username) || string.IsNullOrEmpty(user.password))
            {
                ModelState.AddModelError("", "Username and password are required.");
                return View("Index");
            }

            // Validate user credentials
            var dbUser = await _context.Users
                .FirstOrDefaultAsync(u => u.username == user.username && u.password == user.password);

            if (dbUser != null)
            {
                // Set session values
                HttpContext.Session.SetString("id", dbUser.id.ToString());
                HttpContext.Session.SetString("username", dbUser.username);

                // Optionally add a custom cookie
                var sessionCookie = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps, // Use HTTPS to ensure secure cookies
                    Expires = DateTime.UtcNow.AddMinutes(30) // Session expiration
                };
                Response.Cookies.Append("UserSession", dbUser.username, sessionCookie);

                return RedirectToAction("Index", "Home");
            }
            else
            {
                ModelState.AddModelError("", "Invalid username or password.");
                return View("Index");
            }
        }

    [HttpPost]
    public async Task<IActionResult> Register(Users user)
    {
        if (user == null || string.IsNullOrEmpty(user.username) || string.IsNullOrEmpty(user.password)|| string.IsNullOrEmpty(user.email))
            {
                ModelState.AddModelError("", "Username, password, and email are required.");
                return View("Index");
            }

        else{
            var dbUser = await _context.Users
                .FirstOrDefaultAsync(u => u.username == user.username);

            if (dbUser != null)
            {
                ModelState.AddModelError("", "Username already exists.");
                return View("Index");
            }
            else
            {
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            
        }
    }
    }
}
}
