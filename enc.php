<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="content-type" content="text/html; charset=ISO-8859-1">
    
    <title>Encryption & Decryption</title>
<script src="https://code.jquery.com/jquery-3.6.0.js" integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk=" crossorigin="anonymous"></script>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

<script src="https://www.jqueryscript.net/demo/jQuery-Plugin-For-Easily-Readable-JSON-Data-Viewer/json-viewer/jquery.json-viewer.js"></script>
<link href="https://www.jqueryscript.net/demo/jQuery-Plugin-For-Easily-Readable-JSON-Data-Viewer/json-viewer/jquery.json-viewer.css" type="text/css" rel="stylesheet">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.2/font/bootstrap-icons.css">
    <style type="text/css">

        ::selection { background-color: #E13300; color: white; }
        ::-moz-selection { background-color: #E13300; color: white; }

        body {
            background-color: #fff;
            margin: 40px;
            font: 13px/20px normal Helvetica, Arial, sans-serif;
            color: #4F5155;
        }

        a {
            color: #003399;
            background-color: transparent;
            font-weight: normal;
        }

        h1 {
            color: #444;
            background-color: transparent;
            border-bottom: 1px solid #D0D0D0;
            font-size: 19px;
            font-weight: normal;
            margin: 0 0 14px 0;
            padding: 14px 15px 10px 15px;
        }

        code {
            font-family: Consolas, Monaco, Courier New, Courier, monospace;
            font-size: 12px;
            background-color: #f9f9f9;
            border: 1px solid #D0D0D0;
            color: #002166;
            display: block;
            margin: 14px 0 14px 0;
            padding: 12px 10px 12px 10px;
        }

        #body {
            margin: 0 15px 0 15px;
        }

        p.footer {
            text-align: right;
            font-size: 11px;
            border-top: 1px solid #D0D0D0;
            line-height: 32px;
            padding: 0 10px 0 10px;
            margin: 20px 0 0 0;
        }

        #container {
            margin: 10px;
            border: 1px solid #D0D0D0;
            box-shadow: 0 0 8px #D0D0D0;
        }
    </style>
</head>
<body>

<div id="container">
    <h1>Encryption & Decryption</h1>

    <div id="body">
        <form class='form-horizontal' role='form' id = 'poster_add' name= 'poster_add' enctype='multipart/form-data' action="enc.php" method="POST">
            <label><b>Text or Encryption </b></label><br>
            <textarea name="data" id="data" required="" cols="100" rows="10" style="font-size: 15px; color:#331a00; font-weight: bold;"></textarea>
            <br>
            <div class="row m-2">
             <input type="submit" name="type" class="btn btn-primary m-1 btn-sm col-1" value="Encrypt">
             <input type="submit" name="type" class="btn btn-primary m-1 btn-sm col-1" value="Decrypt"> 
             <input type="reset" name="reset" class="btn btn-danger m-1 btn-sm col-1" value="Clear"> 
    </div>
            <br>
        </form>
    </div>
</div>

</body>
<script type="text/javascript">
    function copyToClipboard(element) {
	  var $temp = $("<input>");
	  $("body").append($temp);
	  $temp.val($(element).text()).select();
	  document.execCommand("copy");
	  $temp.remove();
	}
    function clearContents(containerid) {
        document.getElementById(containerid).value="";
    }
</script>


</html>

<?php

$EncryptionMethod = 'AES-256-CBC';
$secret = hash('sha256', 'xza548sa3vcr641b5ng5nhy9mlo64r6k');
$iv = 'xza548sa3vcr641b';
if (isset($_REQUEST['type']) && isset($_REQUEST['data']) && $_REQUEST['data'] != '') {
    if ($_REQUEST['type'] == 'Encrypt') {
        $plaintext = trim($_REQUEST['data']);
        $Decrypt_value = $_REQUEST['data'];
        $Encrypt_value = openssl_Encrypt($plaintext, $EncryptionMethod, $secret, 0, $iv);
?>
		<div id='container'><div id='body'><br>
		<h5 style='cursor: not-allowed;'><b>COPY HASH </b><button class="btn btn-outline-danger btn-sm" onclick="copyToClipboard('#p1')" style="font-size: 11px;" type="button"><i class="bi bi-clipboard"></i></button></h5>
        <p id='p1' style="font-size: 15px; color:#000080;"><?php echo $Encrypt_value; ?></p><br>
		<h5 style='cursor: not-allowed;'><b>COPY ORIGINAL </b><button class="btn btn-outline-danger btn-sm" onclick="copyToClipboard('#p2')" style="font-size: 11px;" type="button"><i class="bi bi-clipboard"></i></button></h5>
		<p id='p2' style="font-size: 15px; color:#001a00;"><?php echo $Decrypt_value; ?></p>
		<br>
		<h5 style='cursor: not-allowed;'><b>JSON</b></h5></div></div>
<?php
        die();
    } else {
        $enc = $_REQUEST['data'];
        $Decrypt_value = openssl_Decrypt($enc, $EncryptionMethod, $secret, 0, $iv);
        $Encrypt_value = $_REQUEST['data'];
	?>
        <div id='container'><div id='body'><br>
        <h5 style='cursor: not-allowed;'><b>COPY HASH </b><button class="btn btn-outline-danger btn-sm" onclick="copyToClipboard('#p1')" style="font-size: 11px;" type="button"><i class="bi bi-clipboard"></i></button></h5>
        <p id='p1'  style="font-size: 15px; color:#000080;"><?php echo $Encrypt_value; ?></p>
		<br>
		<h5 style='cursor: not-allowed;'><b>COPY ORIGINAL </b><button class="btn btn-outline-danger btn-sm" onclick="copyToClipboard('#p2')" style="font-size: 11px;" type="button"><i class="bi bi-clipboard"></i></button></h5>
		<p id='p2' class="json" style="font-size: 15px; color:#001a00;"><?php echo $Decrypt_value = preg_replace('/\s+/', ' ', $Decrypt_value); ?></p>
		
        <br>
		<h5 style='cursor: not-allowed;'><b>JSON</b></h5>
        <pre id="json-viwer" style="font-size: 15px;"></pre></div></div>;
<?php
    }
}

?>
<script type="text/javascript">
    $(document).ready(function() { 
        let json = eval('(' + `<?php echo $Decrypt_value; ?>` + ')');
        $('#json-viwer').json_viewer(json, {
            collapsed:false
        });
    }); 
</script>