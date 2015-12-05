using System.Web;
using System.Web.Optimization;

namespace Front_End_MVC
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/js/jquery.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/libs/bootstrap/js/bootstrap.js"));

            bundles.Add(new ScriptBundle("~/bundles/leaflet").Include(
                        "~/libs/leaflet/leaflet.js",
                        "~/libs/leaflet/leaflet-indoor/leaflet-indoor.js"
                        ));

            bundles.Add(new ScriptBundle("~/bundles/seatingChart").Include(
                        "~/js/mapModule.js",
                        "~/js/mapController.js",
                        "~/js/map.js",
                        "~/js/adminModule.js"
                        ));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/libs/bootstrap/css/bootstrap.min.css",
                      "~/libs/leaflet/leaflet.css",
                      "~/css/sticky-footer.css",
                      "~/css/user-sidebar.css",
                      "~/css/style.css"
                      ));
        }
    }
}
