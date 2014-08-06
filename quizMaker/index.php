<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<!-- CSS -->
	<link rel="stylesheet" type="text/css" href="css/vendor/fontawesome/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="css/style.css">

	<!-- LIBS
	<script type="text/javascript" src="lib/vendor/jquery.js"></script> -->
	<script type="text/javascript" src="lib/vendor/doT.js"></script>
	<script type="text/javascript" src="lib/vendor/zepto.min.js"></script>
	<script type="text/javascript" src="lib/core.js"></script>

	<!-- CONTROLLERS -->
	<script type="text/javascript" src="src/controllers/dashboardController.js"></script>

	<!-- MODELS -->
	<script type="text/javascript" src="src/models/dashboardModel.js"></script>

	<!-- VIEWS -->
	<script type="text/javascript" src="src/views/dashboardView.js"></script>


	<title>vega</title>
</head>
<body>
	<div class="app">
		<div class="topBar">vega</div>
		<div class="mainContainer"></div>
	</div>
	<script>
		document.onreadystatechange = function () {
		  	var state = document.readyState;
			if (state == 'complete') {
	      		Core.go('Dashboard');
		  	}
		}
	</script>
	<script type="text/javascript" src="src/controllers/quizPlayer.js"></script>
</body>
</html>

