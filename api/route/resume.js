const cvtCtrl = require("../controller/cvController");
const resumRouter = require("express").Router();

resumRouter.post("/resume/savetemplate", cvtCtrl.saveTemplate);
resumRouter.post("/resume/create", cvtCtrl.createCv);
resumRouter.delete("/resume/delete", cvtCtrl.deleteCv);
resumRouter.post("/resume/:id", cvtCtrl.getCv);
resumRouter.post("/resume/gettemplate/:id", cvtCtrl.getTemplate);

// resumRouter.delete('/delete/template',cvtCtrl.delete);
// resumRouter.post("/gettemplate/:id", cvtCtrl.getTemplate);
module.exports = resumRouter;
