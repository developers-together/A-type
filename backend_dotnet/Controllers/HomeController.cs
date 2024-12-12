using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using backend_dotnet.Models;

namespace backend_dotnet.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index(int wpm , int accuracy , string ChallengeTime ,
     string date , string lang)
     
    {
        return View();
    }

    

    // public IActionResult Privacy()
    // {
    //     return View();
    // }



    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
