// IIFE to manage common utility functions
//(function () {

    // used to validate a provided string with specified regex pattern
    // ref - http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    function validateByRegex(element, regexPattern)
    {
        // email - /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        var isValid = false;
        if (regexPattern.test(element.val()))
        {
            isValid = true;
        }
        return isValid;
    }

    // validate email addresses
    function validateEmail(email) {        
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    // used to check whether a passed string is null or empty
    function isNullOrEmpty(element)
    {
        var isNullOrEmpty = false;
        if (element.val() == null || $.trim(element.val()) == "")
        {
            isNullOrEmpty = true;
        }
        return isNullOrEmpty;
    }

    // used to validate a drop down list
    function isValidDropDownListSelection(element)
    {
        var isValidDDLSelection = false;
        try {
            if (parseInt(element.val(), 10) != -1) {
                isValidDDLSelection = true;
            }
        }
        catch (exception)
        {
            isValidDDLSelection = true;     // means a wording selection on ddl
        }        
        return isValidDDLSelection;
    }

    // if with in the string valae there are any spaces they will be replaced by ^ sign
    function cleanSpaces(value)
    {        
        if (value.indexOf(" ") >= 0)
        {
            // contains spaces - " "
            value = value.replace(" ", "^");
        }
        return value;
    }

    // returns true if its only a whole number
    function IsAWholeNumber(value)
    {        
        if (!(isNaN(value)))
        {
            if (value % 1 == 0)
            {
                //alert('Whole Number');
                return true;
            }
            else
            {
                //value('Not a Whole Number');
                return false;
            }
        }
        else
        {
            return false;
        }
    }

    // returns true if its a whole or decimal number
    function IsANumber(value) {        
        if (!(isNaN(value))) 
            return true;        
        else 
            return false;        
    }

    // float value round up
    function RoundUpTo(floatValue, numOfDecimalPlaces)
    {        
        floatValue = parseFloat(floatValue);
        return floatValue.toFixed(numOfDecimalPlaces);
    }

    // reloads current page without angular scope variables
    function ReloadCurrentPage()
    {
        window.location.reload();
    }

    // validation - on key press of numeric only <input /> tag
    function isNumberKey(evt) {
        var charCode = (evt.which) ? evt.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    }

    // validation - on key press of numeric with decimal only <input /> tag
    // avoids 2 times decimal points input
    function isNumberKeyDecimal(evt, id) {
        var containsDecimalDotBeforeKeyPress = document.getElementById(id).value.indexOf(".");  // -1 --> if decimal point not found
        var charCode = (evt.which) ? evt.which : event.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46)
            return false;
        else if (charCode == 46 && containsDecimalDotBeforeKeyPress != -1)                      // avoid 2 times decimal points input
            return false;
        return true;
    }

    // Limit decimal places to 2
    // After the decimal point key press, this will return false if user tries to input three decimal points
    // Ref - http://stackoverflow.com/questions/23221557/restrict-to-2-decimal-places-in-keypress-of-a-text-box and 
    // http://jsfiddle.net/S9G8C/203/
    function validateFloatKeyPressToTwoDecimalPlaces(el, evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        
        // make backspace functional
        if (charCode != 8) {
            var number = el.value.split('.');
            if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            //just one dot
            if (number.length > 1 && charCode == 46) {
                return false;
            }
            //get the carat position
            var caratPos = getSelectionStart(el);
            var dotPos = el.value.indexOf(".");
            if (caratPos > dotPos && dotPos > -1 && (number[1].length > 1)) {
                return false;
            }
            return true;
        }
        else {
            return true;
        }        
    }

    // Ref - http://stackoverflow.com/questions/23221557/restrict-to-2-decimal-places-in-keypress-of-a-text-box and 
    // http://jsfiddle.net/S9G8C/203/
    //thanks: http://javascript.nwbox.com/cursor_position/
    function getSelectionStart(o) {
        if (o.createTextRange) {
            var r = document.selection.createRange().duplicate()
            r.moveEnd('character', o.value.length)
            if (r.text == '') return o.value.length
            return o.value.lastIndexOf(r.text)
        } else return o.selectionStart
    }

    // returns currency html entity value based on currency string passed
    function getCurrencyHtmlEntityValue(currencyStr)
    {
        currencyStr = currencyStr.toUpperCase();
        var currencyHtmlEntVal = '';
        switch (currencyStr) {
            case 'GBP':
                {
                    currencyHtmlEntVal = '&#163';
                    break;
                }
            case 'EURO':
                {
                    currencyHtmlEntVal = '&#8364;'
                    break;
                }
            case 'USD':
                {
                    currencyHtmlEntVal = '&#36;';
                    break;
                }
            default:
                {
                    currencyHtmlEntVal = '&#163';
                    break;
                }
        }
        return currencyHtmlEntVal;
    }

    // returns month name when month number is passed - 0 based
    // 0 - January
    // 11 - December
    function getMonthName(monthNumber)
    {
        var monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
        return monthNames[monthNumber];
    }

    // get date obj in dd/mm/yyyy format
    function GetDateStr(date) {
        date = new Date(date);
        return date.getDate() + ' ' + getMonthName(date.getMonth()) + ' ' + date.getFullYear();         // JS date objects months are zero based
    }
  
    // HH:MM:SS from time span returned
    // 13:57:02.9900000 --> 13:57:02
    function GetTimeStrFromTimeSpan(timeSpan)
    {
        return timeSpan.substring(0,8);
    }


    // used to display error messages 
    function DisplayErrorMessage(errorMessage, element) {
        element.addClass("errorLabel");
        element.text(errorMessage);
    }


    // used to apply red outline border for the validation errors of fields
    function ApplyErrorBorder(element) {
        element.addClass("errorBorder");
    }

    // used to remove error indicating outline borders
    function RemoveOutlineBorders(element) {
        element.removeClass("errorBorder");
    }

    // returns true if a string is not null or not a space/s
    function isNotEmptyOrSpaces(str) {
        var isNotEmpty = false;
        if (str === null || str.match(/^ *$/) !== null) {
            isNotEmpty = false;
        }
        else {
            isNotEmpty = true;
        }
        return isNotEmpty;
    }

    // returns true if the name is only having alphabetical characters, (no numbers, special characters or...etc)
    function isaValidName(name)
    {
        var re = /^[A-Za-z\s]+$/;
        return re.test(name);
    }

    // returns true if a date is in - dd/mm/yyyy format with proper numbers for date, month and year
    function isValidDate(date)
    {
        var re = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
        return re.test(date);
    }

    // generates and returns a string array from specific character/delimiter/seperated long string
    function GetStringArrayFromDelimitedString(delimitedString, delimiter)
    {
        var array = delimitedString.split(delimiter);
        return array;
    }

    // used to enable the top navigation bar - after logged in
    function EnableTopNavigationBar() {
        //$('#topNavigationBar').find('a').prop('disabled', false);
        //$('#topNavigationBar a').unbind("click");
        //$('#topNavigationBar').css("visibility", "visible");
        $('#topNavigationBar').css("visibility", "visible");
    }
   
//}());