using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;

namespace backend_dotnet.Controllers;

public class LoginController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}