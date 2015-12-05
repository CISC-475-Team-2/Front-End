using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Front_End_MVC.Startup))]
namespace Front_End_MVC
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            
        }
    }
}
