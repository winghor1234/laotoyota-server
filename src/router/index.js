import express from 'express';
import UserController from '../controller/user.js';
import ServiceController from '../controller/service.js'
import PromotionController from "../controller/promotion.js"
import TimeController from "../controller/time.js"
import ZoneController from "../controller/zone.js"
import GiftCardController from "../controller/giftcard.js"
import GiftHistoryController from '../controller/gifthistory.js'
import CardController from "../controller/card.js"
import CarController from "../controller/car.js"
import BookingController from "../controller/booking.js"
import FixController from '../controller/fix.js';
import { auth, authSuperAdmin, authAdminOrSuperAdmin } from '../middleware/auth.js'
import BookingDetailController from '../controller/bookingDetail.js';
import EmployeeController from '../controller/employee.js';
import BranchController from '../controller/branch.js';
const router = express.Router();
//----- User----
router.post("/user/register", UserController.Register);
router.post("/user/registerAdmin", auth, authSuperAdmin, UserController.RegisterAdmin);
router.post("/user/login", UserController.Login);
router.post("/user/loginAdmin", UserController.LoginAdmin);

router.get("/user/selAll", auth , UserController.SelectAll);
router.get("/user/selOne/:user_id", auth, authAdminOrSuperAdmin, UserController.SelectOne);
router.get("/user/search", auth, authAdminOrSuperAdmin, UserController.SearchUser);
router.get("/user/profile", auth, UserController.GetProfile); 
router.get("/user/getAll", auth, authSuperAdmin, UserController.getAllUser);
router.put("/user/forgot", UserController.Forgot);
router.put("/user/changePassword", auth, UserController.ChangePassword);
router.put("/user/refresh", UserController.Refresh);
router.put("/user/update", auth, UserController.UpdateUser);
router.put("/user/update/:customer_id", auth, UserController.UpdateCustomer);
router.put("/user/updatePoint", auth, UserController.UpdatePoint); 
router.delete("/user/delete/:customer_id", auth, authSuperAdmin, UserController.DeleteCustomer); 
router.delete("/user/delete", auth, UserController.DeleteUser);
//---- Service ----
router.get("/service/selAll", auth, ServiceController.SelectAll);
router.get("/service/selOne/:service_id", auth, authAdminOrSuperAdmin, ServiceController.SelectOne);
router.post("/service/insert", auth, authAdminOrSuperAdmin, ServiceController.Insert);
router.get("/service/getAll", auth, authAdminOrSuperAdmin, ServiceController.getAllService);
router.put("/service/update/:service_id", auth, authAdminOrSuperAdmin, ServiceController.Updateservice);
router.delete("/service/delete/:service_id", auth, authAdminOrSuperAdmin, ServiceController.Deleteservice);
//---- promotion ----
router.get("/promotion/selAll", auth, PromotionController.SelectAll);
router.get("/promotion/selOne/:promotion_id", auth, PromotionController.SelectOne);
router.get("/promotion/getAll", auth, PromotionController.getAllPromotion);
router.post("/promotion/insert", auth, authAdminOrSuperAdmin, PromotionController.Insert);
router.put("/promotion/update/:promotion_id", auth, authAdminOrSuperAdmin, PromotionController.UpdatePromotion);
router.delete("/promotion/delete/:promotion_id", auth, authAdminOrSuperAdmin, PromotionController.DeletePromotion);
//---- time ----
router.get("/time/selAll", auth, TimeController.SelectAll);
router.get("/time/search", auth, TimeController.SearchTime);
router.get("/time/selBy/:branchId", auth, TimeController.SelectByBranch);
router.get("/time/selOne/:time_id", auth, TimeController.SelectOne);
router.get("/router/getAll", auth, TimeController.getAllTime);
router.post("/time/insert", auth, authAdminOrSuperAdmin, TimeController.Insert);
router.put("/time/update/:time_id", auth, authAdminOrSuperAdmin, TimeController.UpdateTime);
router.put("/time/updateStatus/:time_id", auth, authAdminOrSuperAdmin, TimeController.UpdateTimeStatus);
router.delete("/time/delete/:time_id", auth, authAdminOrSuperAdmin, TimeController.DeleteTime);
//---- zone ----
router.get("/zone/selAll", auth, ZoneController.SelectAll);
router.get("/zone/search", auth, ZoneController.SearchZone);
router.get("/zone/selOne/:zone_id", auth, ZoneController.SelectOne);
router.get("/zone/selBy/:time_id", auth, ZoneController.SelectBy);
router.get("/zone/getAll", auth, ZoneController.getAllZone);
router.post("/zone/insert", auth, authAdminOrSuperAdmin, ZoneController.Insert);
router.put("/zone/update/:zone_id", auth, authAdminOrSuperAdmin, ZoneController.UpdateZone);
router.put("/zone/updateStatus/:zone_id", auth, authAdminOrSuperAdmin, ZoneController.UpdateZoneStatus);
router.delete("/zone/delete/:zone_id", auth, authAdminOrSuperAdmin, ZoneController.DeleteZone);
//---- giftcard ----
router.get("/giftcard/selAll", auth, GiftCardController.SelectAll);
router.get("/giftcard/selOne/:giftcard_id", auth, GiftCardController.SelectOne);
router.get("/giftcard/getAll", auth, GiftCardController.getAllGiftCard);
router.post("/giftcard/insert", auth, authAdminOrSuperAdmin, GiftCardController.Insert);
router.put("/giftcard/update/:giftcard_id", auth, authAdminOrSuperAdmin, GiftCardController.UpdateGiftCard);
router.put("/giftcard/updateStatus/:giftcard_id", auth, authAdminOrSuperAdmin, GiftCardController.UpdateStatus);
router.delete("/giftcard/delete/:giftcard_id", auth, authAdminOrSuperAdmin, GiftCardController.DeleteGiftcard);
//---- giftcardhistory ----
router.get("/gifthistory/selAll", auth, GiftHistoryController.SelectAll);
router.get("/gifthistory/selOne/:gifthistory_id", auth, GiftHistoryController.SelectOne);
router.get("/gifthistory/getAll", auth, GiftHistoryController.getAllGifthistory);
router.post("/gifthistory/insert", auth, GiftHistoryController.Insert);
router.put("/gifthistory/update/:gifthistory_id", auth, GiftHistoryController.UpdateGifthistory);
router.delete("/gifthistory/delete/:gifthistory_id", auth, GiftHistoryController.DeleteGifthistory);
//---- card ----
router.get("/card/selAll", auth, authAdminOrSuperAdmin, CardController.SelectAll);
router.get("/card/selOne/:card_id", auth, authAdminOrSuperAdmin, CardController.SelectOne);
router.get("/card/getAll", auth, authAdminOrSuperAdmin, CardController.getAllCard);
router.post("/card/insert", auth, authAdminOrSuperAdmin, CardController.Insert);
router.put("/card/update/:card_id", auth, authAdminOrSuperAdmin, CardController.UpdateCard);
router.delete("/card/delete/:card_id", auth, authAdminOrSuperAdmin, CardController.DeleteCard);
//---- car ----
router.get("/car/selAll", auth, CarController.SelectAll);
router.get("/car/search", auth, CarController.SearchCar);
router.get("/car/selOne/:car_id", auth, CarController.SelectOne);
router.get("/car/selBy/:userId", auth, CarController.SelectBy);
router.get("/car/getAll", auth, CarController.getAllCar);
router.post("/car/insert", auth, authAdminOrSuperAdmin,CarController.Insert);
router.put("/car/update/:car_id", auth, authAdminOrSuperAdmin, CarController.UpdateCar);
router.delete("/car/delete/:car_id", auth, authAdminOrSuperAdmin, CarController.DeleteCar);
//---- booking ----
router.get("/booking/selAll", auth, authAdminOrSuperAdmin, BookingController.SelectAll);
router.get("/booking/search", auth, BookingController.SearchBooking);
router.get("/booking/selOne/:booking_id", auth, authAdminOrSuperAdmin, BookingController.SelectOne);
router.get("/booking/selByUser", auth, BookingController.SelectByUser);
router.get("/booking/selByBranch/:branch_id", auth, authAdminOrSuperAdmin, BookingController.SelectByBranch);
router.get("/booking/selByStatus", auth, BookingController.SelectBy);
router.get("/booking/getAll", auth, BookingController.getAllBooking);
router.post("/booking/insert", auth, BookingController.Insert);
router.put("/booking/update/:booking_id", auth, BookingController.Updatebooking);
router.put("/booking/updateStatus/:booking_id", auth, authAdminOrSuperAdmin, BookingController.UpdateBookingStatus);
router.delete("/booking/delete/:booking_id", auth, authAdminOrSuperAdmin, BookingController.DeleteBooking);
//----- employ ---
router.get("/employee/selAll", auth, authAdminOrSuperAdmin, EmployeeController.SelectAll);
router.get("/employee/getAll", auth, authSuperAdmin, EmployeeController.getAllSuper);
router.get("/employee/search", auth, authSuperAdmin, EmployeeController.SearchEmployee);
router.get("/employee/selOne/:employee_id", auth, authSuperAdmin, EmployeeController.SelectOne);
router.get("/employee/getAll", auth, authSuperAdmin, EmployeeController.getAllSuper);
router.post("/employee/insert", auth,authSuperAdmin, EmployeeController.Insert);
router.put("/employee/update/:employee_id", auth, authSuperAdmin, EmployeeController.Updateemployee);
router.delete("/employee/delete/:employee_id", auth, authSuperAdmin, EmployeeController.Deleteemployee);
//---- branch ----
router.get("/branch/selAll", auth, BranchController.SelectAll);
router.get("/branch/getAll", auth, BranchController.getAllAdmin);
router.get("/branch/selOne/:branch_id", auth, BranchController.SelectOne);
router.post("/branch/insert", auth, authSuperAdmin, BranchController.Insert);
router.put("/branch/update/:branch_id", auth, authSuperAdmin, BranchController.Updatebranch);
router.delete("/branch/delete/:branch_id", auth, authSuperAdmin, BranchController.Deletebranch);

//----- booking detail -----
router.post("/bookingDetail/insert", auth, BookingDetailController.insert);
router.get("/bookingDetail/selBy/:bookingId", auth, BookingDetailController.getByBooking);
//---- fix ----
router.get("/fix/selAll", auth, authAdminOrSuperAdmin, FixController.SelectAll);
router.get("/fix/search", auth, authAdminOrSuperAdmin, FixController.SearchFix);
router.get("/fix/selOne/:fix_id", auth, authAdminOrSuperAdmin, FixController.SelectOne);
router.get("/fix/selByStatus", auth, authAdminOrSuperAdmin, FixController.SelectBy);
router.get("/fix/getAll", auth, authAdminOrSuperAdmin, FixController.getAllFix);
router.post("/fix/insert", auth, authAdminOrSuperAdmin, FixController.Insert);
router.put("/fix/update/:fix_id", auth, authAdminOrSuperAdmin, FixController.UpdateFix);
router.put("/fix/updateStatus/:fix_id", auth, authAdminOrSuperAdmin, FixController.UpdateFixSuccess);
router.delete("/fix/delete/:fix_id", auth, authAdminOrSuperAdmin, FixController.DeleteFix);
export default router;