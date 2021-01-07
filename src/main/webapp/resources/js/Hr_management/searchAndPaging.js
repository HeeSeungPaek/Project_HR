/*
	파일명: searchAndPaging.js
    설명: 인사관리 - 계정 관리 - 게시판 비동기 
    작성일: 2021-01-06
    작성자: 정민찬
*/
	$('#searchBtn').click(function() {
		let searchType = "";
		let keyword = $('#newKeyword').val();
		if ($('#newSearchType option:selected').val() == "사번") {
			searchType = "EMPNO"
		} else if ($('#newSearchType option:selected').val() == "본부") {
			searchType = "HEADNAME"
		} else if ($('#newSearchType option:selected').val() == "부서") {
			searchType = "DEPTNAME"
		} else if ($('#newSearchType option:selected').val() == "이름") {
			searchType = "ENAME"
		}
		$.ajax({
			url: "/HR_managementRest/getList.do",
			type: "POST",
			dataType:  "JSON",
			data: {
				searchType: searchType,
				keyword: keyword
			},
			success: (data) => {
				insertDatabyAjax(data);
			}
		});
		$('#newKeyword').val("");
	})
	
	
	$(document).on("click", ".page-btn",function(){
		let searchType = $('#oldSearchType').val();
		let keyword = $('#oldKeyword').val();
		let perPageNum = $('#oldPerPageNum').val();
		let page = $(this)[0].text;
		$.ajax({
			url: "/HR_managementRest/getList.do",
			type: "POST",
			dataType:  "JSON",
			data: {
				searchType : searchType,
				keyword : keyword,
				perPageNum : perPageNum,
				page : page
			},
			success: (data) => {
				insertDatabyAjax(data);
			}
		})
	});
	
	$(document).on("click", ".page-btn-prev",function(){
		let searchType = $('#oldSearchType').val();
		let keyword = $('#oldKeyword').val();
		let perPageNum = $('#oldPerPageNum').val();
		let page = parseInt($('#oldPage').val())-1;
		console.log(page);
		$.ajax({
			url: "/HR_managementRest/getList.do",
			type: "POST",
			dataType:  "JSON",
			data: {
				searchType : searchType,
				keyword : keyword,
				perPageNum : perPageNum,
				page : page
			},
			success: (data) => {
				insertDatabyAjax(data);
			}
		})
	});
	
	$(document).on("click", ".page-btn-next",function(){
		let searchType = $('#oldSearchType').val();
		let keyword = $('#oldKeyword').val();
		let perPageNum = $('#oldPerPageNum').val();
		let page = parseInt($('#oldPage').val())+1;
		console.log(page);
		$.ajax({
			url: "/HR_managementRest/getList.do",
			type: "POST",
			dataType:  "JSON",
			data: {
				searchType : searchType,
				keyword : keyword,
				perPageNum : perPageNum,
				page : page
			},
			success: (data) => {
				insertDatabyAjax(data);
			}
		})
	});
	
	
	
	
	function insertDatabyAjax(data){
			console.log(data.criteria);
			console.log(data.list);
			console.log(data.pagination);
			
			$('#empListTable').empty();
			let inputListData = "";
			for (let i=0; i < data.list.length; i++) {
				inputListData += "<tr>"
							  	+"<td>"+data.list[i].EMPNO+"</td>"
								+"<td>"+data.list[i].ENAME+"</td>"
								+"<td>"+data.list[i].HEADNAME+"</td>"
								+"<td>"+data.list[i].DEPTNAME+"</td>"
								+"<td>"+data.list[i].POSITIONNAME+"</td>"
								+"<td>"+data.list[i].CLASSNAME+"</td>"
								+"<td>"
								+"<a href=# class='btn-sm btn-info shadow-sm'><i class='fas fa-check fa-sm text-white'></i></a>"
								+"<a href=# class='btn-sm btn-info shadow-sm'><i class='fas fa-edit fa-sm text-white'></i></a>"
								+"</td>"
								+"</tr>"			
			}
			$('#empListTable').html(inputListData);
			
			
			$('#pagination').empty();
			let inputPaginationData = "";
			if(data.pagination.prev = "true"){
				inputPaginationData += "<li class='page-item'>"
									  +"<a class='page-link page-btn-prev' href='#' aria-label='Previous'>"
									  +"<span aria-hidden='true'>&laquo;</span>"
									  +"<span class='sr-only'>Previous</span>"
									  +"</a></li>"
			}
			for(let i=data.pagination.startPage; i<=data.pagination.endPage; i++){
				console.log(i);
				inputPaginationData += "<li class='page-item'>"
									 + "<a class='page-link page-btn' href='#'>"
									 + i
									 +"</a></li>"
			}
			if(data.pagination.next = "true"){
				inputPaginationData += "<li class='page-item'>"
									  +"<a class='page-link page-btn-next' href='#' aria-label='Next'>"
									  +"<span aria-hidden='true'>&laquo;</span>"
									  +"<span class='sr-only'>Next</span>"
									  +"</a></li>"
			}
			$('#pagination').html(inputPaginationData);
			
			
			$('#oldSearchType').val(data.criteria.searchType);
			$('#oldKeyword').val(data.criteria.keyword);
			$('#oldperPageNum').val(data.criteria.perPageNum);
			$('#oldPage').val(data.criteria.page);	
	}
