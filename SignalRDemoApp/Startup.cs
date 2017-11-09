using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(SignalRDemoApp.Hubs.Startup))]

namespace SignalRDemoApp.Hubs
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
