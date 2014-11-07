var NeedServerData = true;
var PlanoDateFormat = "dd/MM/yyyy";
$(document).ready(function () {
    //alert( VendorDateUpdated );
    $.ajaxSetup({ cache: false });
    if ($.cookies != null) {
        var messCount = parseInt($.cookies.get('messSettings'));
        if (messCount > 0) {
            $("#numberTopSection").css("display", "inline-block");
            $("#numberTop").text(messCount);
            if (typeof MessageScriptAdded == "undefined") {
                if ($("#message-details>li").length == 0) {
                    $("#message-details").hide();
                }
                $("#numberTop").parent().removeAttr("data-toggle");
                $("#numberTop").parent().attr("href", "/Admin/MessageBox");
            }
        }
    }

    if ($.cookies != null) {
        if (typeof VendorDateUpdated != "undefined" && VendorDateUpdated != null && VendorDateUpdated != "") {
            $.cookies.set('tmSpn', VendorDateUpdated);// Using in "/billing"            
        }
    }

    if (typeof window.localStorage == "object" && typeof OFFLINE_KEY_HELPER != "undefined") {
        var localData = localStorage.getObj(OFFLINE_KEY_HELPER.VENDOR_DATE_UPDATED);
        if (typeof VendorDateUpdated != "undefined") {
            if (VendorDateUpdated != undefined && VendorDateUpdated != null && VendorDateUpdated != "" && localData != null) {
                if (localData == VendorDateUpdated) {
                    NeedServerData = false;
                }
            }
        }
        var localInventoryData = localStorage.getObj(OFFLINE_KEY_HELPER.RETAIL_INVENTORY);
        if (typeof InventoryDateUpdated != "undefined") {
            if (localInventoryData != null && localInventoryData.DateUpdated != InventoryDateUpdated) {
                localStorage.removeItem(OFFLINE_KEY_HELPER.RETAIL_INVENTORY);
            }
        }
    }

    if (typeof OFFLINE_KEY_HELPER !== "undefined") {
        // Reset (Clear) the Local Staorage from our side whenever needed     
        var StorageVersion = "PLANO_LOCAL_STORAGE_10";
        try {
            if (localStorage.getItem(OFFLINE_KEY_HELPER.LOCAL_STRORAGE_VERSION) == null || localStorage.getItem(OFFLINE_KEY_HELPER.LOCAL_STRORAGE_VERSION) != StorageVersion) {
                localStorage.clear();
                localStorage.setItem(OFFLINE_KEY_HELPER.LOCAL_STRORAGE_VERSION, StorageVersion);
            }
        } catch (e) {

        }
    }
    // FOR HANDLING DATE FORMAT WITH USER SELECTION AND MANUAL TYPE
    function removeDuplicateSeparator(string, seprator) {
        var result = [];
        var i = null;
        var length = string.length;
        var previous = null;
        for (i = 0; i < length; i += 1) {
            var current = string.charAt(i);
            if (current == seprator) {
                if (current !== previous) {
                    result.push(current);
                }
            } else {
                result.push(current);
            }
            previous = current;
        }
        return result.join("");
    }

    var dateFormatString = "";
    if (typeof PlanoDateFormat != "undefined")
        dateFormatString = PlanoDateFormat;

    if (typeof ko !== "undefined") {
        if (ko.bindingHandlers != null && ko.bindingHandlers.kendoDatePicker != null) {
            ko.bindingHandlers.kendoDatePicker.options = {
                format: dateFormatString
            };
        }
        if (ko.bindingHandlers != null && ko.bindingHandlers.kendoDateTimePicker != null) {
            ko.bindingHandlers.kendoDateTimePicker.options = {
                format: dateFormatString + " hh:mm tt"
            };
        }
    }
    $("body").on("keydown", '[data-role="datepicker"]', function (e) {
        var key = e.charCode || e.keyCode || 0;
        // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
        // home, end, period, and numpad decimal
        return (
            key == 8 ||
            key == 9 ||
            key == 46 ||
            key == 110 ||
            (key >= 35 && key <= 40) ||
            (key >= 48 && key <= 57) ||
            (key >= 96 && key <= 105));
    });
    $("body").on("keyup", '[data-role="datepicker"]', function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
            // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
            // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        var value = $(this);
        var date = $.trim(value.val());
        var dateFormat = dateFormatString.toLocaleLowerCase();
        var seprater = "";

        switch (dateFormat) {
            case "dd/mm/yyyy":
                date = dateFormatHelper1(event, date, "/");
                break;
            case "dd-mm-yyyy":
                date = dateFormatHelper1(event, date, "-");
                break;
            case "mm/dd/yyyy":
                date = dateFormatHelper2(event, date, "/");
                break;
            default:
                break;
        }
        value.val(date);
        event.preventDefault();
    });

    //handle for dd/mm/yyyy,dd-mm-yyyy
    function dateFormatHelper1(event, date, sep) {
        var currentYear = new Date().getFullYear();
        if (date.toString().length == 1) {
            var dV = Number(date);
            if (dV > 3) {
                date = "0" + dV;
            }
        }
        if (date.toString().length == 2 || date.toString().length == 3) {
            if (Number(date) > 31) {
                date = 31;
            }
        }
        if (date.toString().length == 5 || date.toString().length == 6) {
            var dV = date.split(sep);
            var day = dV[0];
            var month = dV[1];

            if (month == null)
                month = 12;
            if (day == null)
                day = 31;

            if (Number(month) > 12) {
                month = 12;
            }
            if (Number(day) > 31) {
                var d = new Date(new Date().getFullYear(), Number(month), 0).getDate();
                day = d;
            }

            date = day + sep + month;
        }
        if (date.toString().length == 10) {
            var dV = date.split(sep);
            var day = dV[0];
            var month = dV[1];
            var year = dV[2];

            if (month == null)
                month = 12;
            if (day == null)
                day = 31;
            if (year == null)
                year = new Date().getFullYear();

            if (Number(year) < 1870 || Number(year) > 3000) {
                year = new Date().getFullYear();
            }
            if (Number(month) > 12) {
                month = 12;
            }
            if (Number(day) > 31) {
                var d = new Date(year, Number(month), 0).getDate();
                day = d;
            }
            date = day + sep + month + sep + year;
        }
        if (date.toString().length == 3) {
            if (date.indexOf(sep) < 0) {
                var typedChar = String.fromCharCode(event.which)
                var dtChar = date.substring(0, 2);
                date = dtChar + sep + typedChar;
            }
        }
        if (date.toString().length == 4) {
            var dV = date.split(sep);
            var month = dV[1];
            if (month == null)
                month = 12;

            if (Number(month) > 3) {
                var rp = "0" + month;
                if (Number(dV[0]) > 31) {
                    var d = new Date(currentYear, Number(month), 0).getDate();
                    dV[0] = d;
                }
                date = dV[0] + sep + rp;
            }
        }
        if (date.toString().length >= 10) {
            var dV = date.split(sep);
            var month = dV[1];
            var day = dV[0];
            var year = dV[2];
            if (year == null)
                year = currentYear;
            if (month == null)
                month = 12;
            if (day == null)
                day = 31;

            if (Number(year) < 1870 || Number(year) > 3000) {
                date = day + sep + month + sep + currentYear;
            }
        }
        if (date.toString().length == 2 || date.toString().length == 5)
            date = date + sep;

        return date;
    }

    //handle for mm/dd/yyyy
    function dateFormatHelper2(event, date, sep) {
        var currentYear = new Date().getFullYear();
        if (date.toString().length == 1) {
            var dV = Number(date);
            if (dV > 1) {
                date = "0" + dV;
            }
        }
        if (date.toString().length == 2 || date.toString().length == 3) {
            if (Number(date) > 12) {
                date = 12;
            }
        }
        if (date.toString().length == 5 || date.toString().length == 6) {
            var dV = date.split(sep);
            var day = dV[1];
            var month = dV[0];


            if (month == null)
                month = 12;
            if (day == null)
                day = 31;

            if (Number(month) > 12) {
                month = 12;
            }
            if (Number(day) > 31) {
                var d = new Date(new Date().getFullYear(), Number(month), 0).getDate();
                day = d;
            }

            date = month + sep + day;
        }
        if (date.toString().length == 10) {
            var dV = date.split(sep);
            var day = dV[1];
            var month = dV[0];
            var year = dV[2];

            if (month == null)
                month = 12;
            if (day == null)
                day = 31;
            if (year == null)
                year = new Date().getFullYear();

            if (Number(year) < 1870 || Number(year) > 3000) {
                year = new Date().getFullYear();
            }
            if (Number(month) > 12) {
                month = 12;
            }
            if (Number(day) > 31) {
                var d = new Date(year, Number(month), 0).getDate();
                day = d;
            }
            date = month + sep + day + sep + year;
        }
        if (date.toString().length == 3) {
            if (date.indexOf(sep) < 0) {
                var typedChar = String.fromCharCode(event.which)
                var dtChar = date.substring(0, 2);
                date = dtChar + sep + typedChar;
            }
        }
        if (date.toString().length == 4) {
            var dV = date.split(sep);
            var day = dV[1];
            if (day == null)
                day = 31;

            if (Number(day) > 3) {
                var rp = "0" + day;
                if (Number(dV[0]) > 12) {
                    dV[0] = 12;
                }
                date = dV[0] + sep + rp;
            }
        }
        if (date.toString().length >= 10) {
            var dV = date.split(sep);
            var month = dV[0];
            var day = dV[1];
            var year = dV[2];
            if (year == null)
                year = currentYear;
            if (month == null)
                month = 12;
            if (day == null)
                day = 31;

            if (Number(year) < 1870 || Number(year) > 3000) {
                date = month + sep + day + sep + currentYear;
            }
        }
        if (date.toString().length == 2 || date.toString().length == 5)
            date = date + sep;
        return date;
    }
    $("body").on("change", '[data-role="datepicker"]', function () {
        var value = $(this);
        var kendoDatePicker = $(this).data('kendoDatePicker');

        if (kendoDatePicker != null) {
            if ($(this).data('bind') != null) {
                var bindValue = $(this).data('bind').replace(/ /g, "");
                var depthString = "depth:";
                if (bindValue.indexOf(depthString) > 0) {
                    return;
                }
            }
        }

        var date = $.trim(value.val());
        var seprator = dateFormatString.substring(2, 3);
        date = date.replace(/[a-zA-Z]/g, "");
        date = date.replace(/[^a-zA-Z0-9]/g, seprator);
        if (date.indexOf(seprator + seprator) > 0) {
            date = removeDuplicateSeparator(date, seprator);
        }
        var unFormatedDate = null;
        if (date.length > 0) {
            unFormatedDate = date.unformatDate();
        }
        if (unFormatedDate != null && unFormatedDate.toString() == "Invalid Date") {
            unFormatedDate = null;
            if (date.length > 0)
                planonotify.info("Please enter valid date (" + dateFormatString.toLocaleLowerCase() + ")");
        }

        if (kendoDatePicker != null) {

            kendoDatePicker.value(unFormatedDate);
            //if ($.trim(kendoDatePicker.options.format) != dateFormatString) {
            //    kendoDatePicker.options.format = dateFormatString;
            //}
            if ($(this).data('bind') != null) {
                var bindValue = $(this).data('bind').replace(/ /g, "");

                var valueString = "value:";
                if (bindValue.indexOf(valueString) > 0) {

                    var temp = findAttributeFor(bindValue, valueString);
                    var dataFor = null;
                    if (temp.startsWith("$parent")) {
                        dataFor = ko.contextFor(this).$parent;
                        temp = temp.replace("$parent.", "");
                    } else if (temp.startsWith("$root")) {
                        dataFor = ko.contextFor(this).$root;
                        temp = temp.replace("$root.", "");
                    } else {
                        dataFor = ko.dataFor(this);
                    }

                    if (kendoDatePicker.options != null && kendoDatePicker.options.max != null) {
                        if (typeof kendoDatePicker.options.max == "object" && unFormatedDate != null) {
                            var maxDate = kendoDatePicker.options.max.getShortDate().getTime();
                            var selectedDate = unFormatedDate.getTime();
                            if (selectedDate > maxDate) {
                                unFormatedDate = new Date(maxDate);
                                kendoDatePicker.value(unFormatedDate);
                                planonotify.info("Maximum date is " + new Date(maxDate).toVendorDate());
                            }
                        }
                        if (typeof kendoDatePicker.options.min == "object" && unFormatedDate != null) {
                            var minDate = kendoDatePicker.options.min.getShortDate().getTime();
                            var selectedDate = unFormatedDate.getTime();
                            if (selectedDate < minDate) {
                                unFormatedDate = new Date(minDate);
                                kendoDatePicker.value(unFormatedDate);
                                planonotify.info("Minimum date is " + new Date(minDate).toVendorDate());
                            }
                        }
                    }

                    if (dataFor != null && dataFor[temp] != null) {
                        if (typeof dataFor[temp] == "function") {
                            dataFor[temp](unFormatedDate);
                        } else {
                            dataFor[temp] = unFormatedDate;
                        }
                    }
                }
            }
            if (kendoDatePicker.options != null) {
                if (kendoDatePicker.options.change != null) {
                    kendoDatePicker.trigger("change");
                }
                if (kendoDatePicker.options.select != null) {
                    kendoDatePicker.trigger("select");
                }
            }
        }
    });
    function findAttributeFor(bindValue, valueString) {
        var index = bindValue.indexOf(valueString);
        var temp = bindValue.substring(index + valueString.length);
        if (temp.indexOf(",") > 0) {
            index = temp.indexOf(",");
            temp = temp.substring(0, index);
        }
        if (temp.indexOf("}") > 0) {
            index = temp.indexOf("}");
            temp = temp.substring(0, index);
        }
        temp = $.trim(temp);
        return temp;
    }
    function findDataFor(temp, that) {
        var dataFor = null;
        if (temp.startsWith("$parent")) {
            dataFor = ko.contextFor(that).$parent;
            temp = temp.replace("$parent.", "");
        } else if (temp.startsWith("$root")) {
            dataFor = ko.contextFor(that).$root;
            temp = temp.replace("$root.", "");
        } else {
            dataFor = ko.dataFor(that);
        }
        return dataFor;
    }
});


// For convenience...

Date.prototype.getTimeString = function () {
    return dateFormat(this, 'hh:MM TT');
}

Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
Date.prototype.toPlanoLocalDateString = function (utc) {
    return dateFormat(this, "fullDate", utc);
};
Date.prototype.toServerDateString = function (utc) {
    return dateFormat(this, "fullDate", utc);
};
Date.prototype.toFullString = function (utc) {
    return dateFormat(this);
};

Date.prototype.toVendorDate = function (utc) {
    var vendorDateFormat = PlanoDateFormat.toLowerCase();
    return dateFormat(this, vendorDateFormat, utc);
};
Date.prototype.getShortDate = function () {
    var today = this;
    return new Date((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear());
};
Date.prototype.ShortToDate = function (v) {
    var val = this;
    var dDate = new Date(v);

    var h = val.getHours();
    var m = val.getMinutes();

    return new Date(dDate.setHours(h, m, 0));

};
Date.prototype.addDays = function (days) {
    return new Date(this.setDate(this.getDate() + days));
};
Date.prototype.addMonths = function (months) {
    return new Date(this.setMonth(this.getMonth() + months));
};
Date.prototype.addYears = function (years) {
    return new Date(this.setFullYear(this.getFullYear() + years));
};

Date.prototype.getFinStartDate = function () {
    var reportDate = this;
    var stMonth = new Date(FinancialYearDate).getMonth();
    var stYear = reportDate.getFullYear();
    if (stMonth > reportDate.getMonth()) {
        stYear = stYear - 1;
    }
    var startFullDate = new Date((stMonth + 1) + "/1/" + stYear);
    return startFullDate;
};

Date.prototype.getFinStartYear = function () {
    var reportDate = this;
    var year = reportDate.getFinStartDate().getFullYear();
    return year;
};

Date.prototype.getFinStartMonth = function () {
    var reportDate = this;
    var mon = reportDate.getFinStartDate().getMonth();
    return mon;
};

Date.prototype.getFinEndDate = function () {
    var reportDate = this;
    var finDate = reportDate.getFinStartDate();
    var finEndDate = new Date(finDate.getFullYear() + 1, finDate.getMonth(), 0);
    return finEndDate;
};

Date.prototype.getFinEndYear = function () {
    var reportDate = this;
    var year = reportDate.getFinEndDate().getFullYear();
    return year;
};

Date.prototype.getFinEndMonth = function () {
    var reportDate = this;
    var mon = reportDate.getFinEndDate().getMonth();
    return mon;
};


String.prototype.replaceAll = function (source, dest) {
    var re = new RegExp(source, "gi");
    return this.replace(re, dest);
};
String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};

// color Code
Number.prototype.GetColorCode = function (fr, len) {
    var val = this;
    var s = "", c = '0';

    if (val == 0) {
        if (fr != null) {
            if (fr == "b") {
                return "transparent";
            }
        } else {
            s = "000000";
        }
    } else {
        s = val.toString(16);
    }

    // just padding 0 code

    len = len || 6;
    while (s.length < len) s = c + s;
    return "#" + s;
};
if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) == 0;
    };
};
String.prototype.GetColorCode = function (fr, len) {
    var val = this;
    if (val.indexOf("#") !== -1) {
        return val;
    } else if (val == "transparent" || val == "initial") {
        return val;
    } else {
        var s = "", c = '0';
        if (val == 0 || val == null) {
            if (fr != null) {
                if (fr == "b") {
                    return "transparent";
                }
            } else {
                s = "000000";
            }
        } else {
            s = val.toString(16);
        }

        // just padding 0 code
        len = len || 6;
        while (s.length < len) s = c + s;
        return "#" + s;
    }
};

String.prototype.contains = function (it) { return this.indexOf(it) !== -1; };
String.prototype.GetDate = function () {
    return new Date(parseInt(this.substring(6)));
};
String.prototype.CSTicksToJSTicks = function () {
    var unixEpoch = 621355968000000000;
    var ticks = 10000;
    var MilliSeconds = (this - unixEpoch) - ticks;
    return MilliSeconds;
};
String.prototype.unformatDate = function () {
    dateGiven = this;
    var vendorDateFormat = PlanoDateFormat.toLowerCase();

    var DateString = dateGiven.split(" ")[0];
    var TimeString = dateGiven.split(" ")[1];

    TimeString = TimeString == null ? "" : TimeString;

    var hour = 0;
    var min = 0;
    if (TimeString.length > 0) {
        hour = parseInt(TimeString.split(":")[0]);
        min = parseInt(TimeString.split(":")[1]);
    }

    var date = "";
    var returnDate = new Date();
    switch (vendorDateFormat) {
        case "dd/mm/yyyy":
            date = DateString.split("/").reverse();
            if (date.length > 1)
                returnDate = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]), hour, min);
            break;
        case "dd-mm-yyyy":
            date = DateString.split("-").reverse();
            if (date.length > 1)
                returnDate = new Date(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]), hour, min);
            break;
        case "mm/dd/yyyy":
            date = DateString.split("/").reverse();
            if (date.length > 1)
                returnDate = new Date(parseInt(date[0]), parseInt(date[2]) - 1, parseInt(date[1]), hour, min);
            break;
        default:
            returnDate = new Date($.trim(DateString + " " + TimeString));
            break;
    }
    return returnDate;
}
String.prototype.toVendorDate = function (utc) {
    var givenString = this;
    var date = null;
    if (givenString.startsWith("/Date")) {
        date = givenString.GetDate();
    } else {
        var unFormatedDate = givenString.unformatDate();
        date = unFormatedDate;
    }
    if (date != null) {
        if (Object.prototype.toString.call(date) === "[object Date]") {
            if (!isNaN(date.getTime())) {
                return date.toVendorDate();
            }
        }
    }
    return null;
};
Array.prototype.toDictionary = function (key, key2) {
    if (this.length > 0) {
        var a = {};
        if (key != undefined) {
            for (i = 0; i < this.length; i++) {
                c = this[i][key];
                if (key2 != undefined) {
                    c = this[i][key] + "-" + this[i][key2];
                }
                if (c != undefined) {
                    a[c] = this[i];
                } else {
                    // return null;
                }
            }
        }
        else {
            for (i = 0; i < this.length; i++) {
                var arrVal = this[i].split("=");  // Just to read Cookies. Just get data as Array from Cookie then call it to hit here.
                if (arrVal != undefined) {
                    c = arrVal[0];
                    if (arrVal.length > 1) {
                        a[c] = arrVal[1];
                    }
                } else {
                    //return null;
                }
            }
        }
        return a;
    }
    return null;
};

var toArray = function (Data) {
    var newArray = [];
    var count = 0;
    $.each(Data, function (i, item) {
        if (count < Object.getOwnPropertyNames(Data).length)
            newArray.push(item);
        count++;
    });
    return newArray;
};

Storage.prototype.getInventory = function () {
    return this.getObj(OFFLINE_KEY_HELPER.RETAIL_INVENTORY);
};
Storage.prototype.getInventoryByLocation = function () {
    var invData = this.getObj(OFFLINE_KEY_HELPER.RETAIL_INVENTORY);
    if (invData != null) {
        if (invData.Data != null) {
            return invData.Data[CurrentLocationID];
        }
    }
    return null;
};

Storage.prototype.setInventory = function (Data) {
    var inventoryData = this.getInventory();
    if (inventoryData == null) {
        var locInv = {};
        locInv[CurrentLocationID] = Data;
        inventoryData = {
            Data: locInv,
            DateUpdated: InventoryDateUpdated
        }
    } else {
        inventoryData.Data[CurrentLocationID] = Data;
        inventoryData.DateUpdated = InventoryDateUpdated;
    }
    localStorage.setObj(OFFLINE_KEY_HELPER.RETAIL_INVENTORY, inventoryData);
};

Storage.prototype.getData = function (key, ignoreTimeStamp) {
    var localData = localStorage.getObj(key);
    if (localData != null) {
        if (localData.TimeStamp != null && ignoreTimeStamp == null) {
            if (localData.TimeStamp == VendorDateUpdated) {
                return localData;
            } else {
                return null;
            }
        }
        return localData;
    }
    return null;
};
Storage.prototype.setData = function (key, Data) {
    if (Data != null) {
        var storeData = {
            Data: Data,
            TimeStamp: VendorDateUpdated
        }
        localStorage.setObj(OFFLINE_KEY_HELPER.VENDOR_DATE_UPDATED, VendorDateUpdated);
        localStorage.setObj(key, storeData);
    } else {
        localStorage.removeItem(key);
    }
};
Storage.prototype.setDataWithDate = function (key, Data, LastUpdatedDate) {
    var storeData = {
        TimeStamp: VendorDateUpdated,
        SavedTime: new Date().getShortDate().getTime(),
        Data: Data
    }
    localStorage.setObj(key, storeData);
};
Storage.prototype.getOfflineData = function (key) {
    var localData = localStorage.getObj(key);
    if (localData != null) {
        return localData;
    }
    return null;
};
Storage.prototype.setOfflineData = function (key, Data) {
    var storeData = {
        Data: Data
    }
    localStorage.setObj(key, storeData);
};
Storage.prototype.setDrugList = function (Data) {
    this.setDataWithDate(OFFLINE_KEY_HELPER.DRUG_LIST + "/" + CurrentLocationID, Data, null);
};
Storage.prototype.getDrugList = function () {
    return this.getData(OFFLINE_KEY_HELPER.DRUG_LIST + "/" + CurrentLocationID);
};
Storage.prototype.setEventList = function (Data, updatedDate, eventDay) {
    if (Data == null || Data.length == 0)
        return false;
    var eventDate = new Date(eventDay).getTime();
    var existingEventList = localStorage.getEventList();
    var noOfItems = 0;
    if (existingEventList != null) {
        var eventsList = existingEventList.Data;
        noOfItems = existingEventList.Count;
        if (eventsList[eventDate] != undefined) {
            eventsList[eventDate] = Data;
        } else {
            if (noOfItems < 4) {
                eventsList[eventDate] = Data; // Even if already exists,then it would be overridden.
                noOfItems++;
            }
            else {
                var iteration = 0;
                for (var key in eventsList) {
                    if (iteration == 1) {
                        eventsList[key] = undefined;
                        eventsList[eventDate] = Data;
                        break;
                    }
                    iteration++;
                }
            }
        }
        existingEventList.Data = eventsList;
    } else {
        existingEventList = { Data: {} };
        existingEventList.Data[eventDate] = Data;  // For today events when no data in localStorage
    }
    var storeEventsData = {
        TimeStamp: updatedDate,
        Data: existingEventList.Data,
        Count: noOfItems
    }
    localStorage.setObj(OFFLINE_KEY_HELPER.EVENT_LIST + "/" + CurrentLocationID, storeEventsData);
};
Storage.prototype.getEventList = function () {
    //var eventDate = new Date(eDate).getTime();
    return this.getData(OFFLINE_KEY_HELPER.EVENT_LIST + "/" + CurrentLocationID, true);
};
Storage.prototype.setCusCustFields = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.CCF_DETAILS + "/" + CurrentLocationID, Data);
};
Storage.prototype.getCusCustFields = function () {
    return this.getData(OFFLINE_KEY_HELPER.CCF_DETAILS + "/" + CurrentLocationID);
};
Storage.prototype.setBillTemplate = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.BILL_TEMPLATE, Data)
};
Storage.prototype.getBillTemplate = function () {
    return this.getData(OFFLINE_KEY_HELPER.BILL_TEMPLATE);
};

Storage.prototype.setRSL = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.RSL + "/" + CurrentLocationID, Data);
};
Storage.prototype.getRSL = function () {
    return this.getData(OFFLINE_KEY_HELPER.RSL + "/" + CurrentLocationID);
};
Storage.prototype.setPrintHTML = function (key, Data) {
    this.setOfflineData("Bill_" + key, Data);
};
Storage.prototype.getPrintHTML = function (key) {
    return this.getOfflineData("Bill_" + key);
};
Storage.prototype.setCurrentPrint = function (Data) {
    this.setOfflineData("CurrentPrint", Data);
};
Storage.prototype.getCurrentPrint = function () {
    return this.getOfflineData("CurrentPrint");
};
Storage.prototype.setBusinessHours = function (Data, date) {
    if (Data == null)
        return false;
    var busDate = new Date(date).getTime();
    var busHoursList = localStorage.getBusinessHours();
    var noOfItems = 0;
    if (busHoursList != null) {
        var busHoursListData = busHoursList.Data;
        noOfItems = busHoursList.Count;
        if (busHoursListData[busDate] != undefined) {
            busHoursListData[busDate] = Data;
        } else {
            if (noOfItems < 4) {
                busHoursListData[busDate] = Data; // Even if already exists,then it would be overridden.
                noOfItems++;
            } else {
                var iteration = 0;
                for (var key in busHoursListData) {
                    if (iteration == 1) {
                        busHoursListData[key] = undefined;
                        busHoursListData[busDate] = Data;
                        break;
                    }
                    iteration++;
                }
            }
        }
        busHoursList.Data = busHoursListData;
    } else {
        busHoursList = { Data: {} };
        busHoursList.Data[busDate] = Data;  // For today events when no data in localStorage
    }
    var storeBusHoursData = {
        Data: busHoursList.Data,
        Count: noOfItems
    }
    localStorage.setObj(OFFLINE_KEY_HELPER.BUSINESS_HOURS + "/" + CurrentLocationID, storeBusHoursData);
    //this.setData( OFFLINE_KEY_HELPER.BUSINESS_HOURS + "/" + CurrentLocationID + "/" + date, Data );
};
Storage.prototype.getBusinessHours = function () {
    return this.getData(OFFLINE_KEY_HELPER.BUSINESS_HOURS + "/" + CurrentLocationID);
};
Storage.prototype.setTaxes = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.TAXES + "/" + CurrentLocationID, Data);
};
Storage.prototype.getTaxes = function () {
    return this.getData(OFFLINE_KEY_HELPER.TAXES + "/" + CurrentLocationID);
};

Storage.prototype.setPaymentTypes = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.PAYMENTS, Data);
};
Storage.prototype.getPaymentTypes = function () {
    return this.getData(OFFLINE_KEY_HELPER.PAYMENTS);
};
Storage.prototype.setStatus = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.STATUS, Data);
};
Storage.prototype.getStatus = function () {
    return this.getData(OFFLINE_KEY_HELPER.STATUS);
};
Storage.prototype.setLoyaltyConvertionData = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.LOYALTY_CONVERTION, Data);
};
Storage.prototype.getLoyaltyConvertionData = function () {
    return this.getData(OFFLINE_KEY_HELPER.LOYALTY_CONVERTION);
};
Storage.prototype.setUserDefinedPromosData = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.USER_DEFINED_PROMOS + "/" + CurrentLocationID, Data);
};
Storage.prototype.getUserDefinedPromosData = function () {
    return this.getData(OFFLINE_KEY_HELPER.USER_DEFINED_PROMOS + "/" + CurrentLocationID);
};
Storage.prototype.setMembershipMaster = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.MEMBERSHIPS_MASTER, Data);
};
Storage.prototype.getMembershipMaster = function () {
    return this.getData(OFFLINE_KEY_HELPER.MEMBERSHIPS_MASTER);
};
Storage.prototype.setValueCardsMaster = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.VALUECARDS_MASTER, Data);
};
Storage.prototype.getValueCardsMaster = function (Data) {
    return this.getData(OFFLINE_KEY_HELPER.VALUECARDS_MASTER);
};
Storage.prototype.setTreatmentPlanMaster = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.TREATMENTPLAN_MASTER, Data);
};
Storage.prototype.getTreatmentPlanMaster = function () {
    return this.getData(OFFLINE_KEY_HELPER.TREATMENTPLAN_MASTER);
};
Storage.prototype.setPackageMaster = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.TREATMENTPLAN_MASTER + "/" + CurrentLocationID, Data);
};
Storage.prototype.getPackageMaster = function () {
    return this.getData(OFFLINE_KEY_HELPER.TREATMENTPLAN_MASTER + "/" + CurrentLocationID);
};
Storage.prototype.setPackages = function (Data)  // This is for templates in calendar
{
    this.setData(OFFLINE_KEY_HELPER.PACKAGE_MASTER, Data);
};
Storage.prototype.getPackages = function () // This is for templates in calendar
{
    return this.getData(OFFLINE_KEY_HELPER.PACKAGE_MASTER);
};

Storage.prototype.setCustomerStatus = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.CUST_STATUS_MASTER, Data);
};
Storage.prototype.getCustomerStatus = function () {
    return this.getData(OFFLINE_KEY_HELPER.CUST_STATUS_MASTER);
};

Storage.prototype.setICTCode = function (Data) {
    this.setData(OFFLINE_KEY_HELPER.ICTCODE + "/" + CurrentLocationID, Data);
};
Storage.prototype.getICTCode = function () {
    return this.getData(OFFLINE_KEY_HELPER.ICTCODE + "/" + CurrentLocationID);
};

Storage.prototype.setDataByURL = function (key, obj) {
    var data = {
        Data: obj,
        TimeStamp: VendorDateUpdated
    };
    return localStorage.setObj(key, data);
};
Storage.prototype.getDataByURL = function (key) {
    var data = localStorage.getObj(key);
    if (data != null) {
        if (data.TimeStamp == VendorDateUpdated) {
            return data.Data;
        }
    }
    return null;
};

Storage.prototype.setObj = function (key, obj) {
    try {
        return this.setItem(key, JSON.stringify(obj))
    } catch (e) {

    }

};
Storage.prototype.getObj = function (key) {
    try {
        return JSON.parse(this.getItem(key));
    } catch (e) {

    }

};