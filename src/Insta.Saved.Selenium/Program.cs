using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using OpenQA.Selenium.Chrome;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
      services.AddSingleton<IWebDriverFactory, ChromeDriverFactory>();
      services.AddScoped<IInstagramService, InstagramService>();
      services.AddScoped<ILoginHandler, LoginHandler>();
    })
    .Build();

var instagramService = host.Services.GetRequiredService<IInstagramService>();

await instagramService.RunAsync();