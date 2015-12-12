using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Front_End_MVC.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Admin()
        {
            return View();
        }

        public ActionResult MapPartial()
        {
            return PartialView();
        }

        [HttpPost]
        public ActionResult SaveMarker(string path, string data)
        {
            try {
                var pathRel = Server.MapPath("~/" + path);
                System.IO.File.WriteAllText(pathRel, data);
                return Json(new { success = true, responseText = "File saved to server." }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new { success = false, responseText = "Could not write to server." + ex.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}