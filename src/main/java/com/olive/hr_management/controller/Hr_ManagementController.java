/*

    파일명: HrManageMentController.java
    설명: 인사관리 Controller 
    작성일: 2021-01-02
    작성자: 백희승
*/
package com.olive.hr_management.controller;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.olive.dto.Dept;
import com.olive.dto.Emp;
import com.olive.dto.Head;
import com.olive.dto.Position;
import com.olive.dto.SalaryInfo;
import com.olive.hr_management.service.Hr_managementService;

import paging.Criteria;
import paging.Pagination;
import paging.PagingService;

@Controller
@RequestMapping("/HR_management/")
public class Hr_ManagementController {

	@Autowired
	private Hr_managementService service;

	@Autowired
	private PagingService pagingService;

	// 암호화 객체
	@Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	@RequestMapping(value = "Salary.do", method = RequestMethod.GET)
	public String salaryPage(Model model, Criteria cri) {
		cri.setCriteria("salaryinfo", "SAL_DATE", "DESC");

		int totalCount = pagingService.getListCount(cri);
		cri.setPerPageNum(5);
		Pagination pagination = new Pagination(cri, totalCount);

		List<Map<String, Object>> result = pagingService.getList(cri);

		model.addAttribute("list", result);
		model.addAttribute("pagination", pagination);
		model.addAttribute("criteria", cri);

		return "HR_management/Salary";
	}

	@RequestMapping(value = "SalaryDetail.do", method = RequestMethod.GET)
	public String getSalaryDetail(Model model, String date, int empno) {
		SalaryInfo salaryInfo = service.getSalaryDetail(date, empno);
		salaryInfo.conversionFormality();
		model.addAttribute("salaryInfo", salaryInfo);
		return "HRinfo/salaryDetail";
	}

	// Excel File
	@ResponseBody
	@RequestMapping(value = "uploadExcelFile.do", method = RequestMethod.POST)
	public boolean uploadExcelFile(MultipartFile excelFile, MultipartHttpServletRequest request) {
		System.out.println("업로드 진행");
		excelFile = request.getFile("excelFile");
		
		if (excelFile == null || excelFile.isEmpty()) {
			throw new RuntimeException("엑셀파일을 선택해주세요...");
		}
		File destFile = new File("C:\\Users\\Min_Chan\\Desktop\\FinalProject\\EXCEL\\" + excelFile.getOriginalFilename());
		try {
			excelFile.transferTo(destFile);
		} catch (Exception e) {
			throw new RuntimeException(e.getMessage(), e);
		}
		boolean result = service.excelUpload(destFile);
		destFile.delete();
		
		return result;
	}

	// 인사관리 > 조직 관리 페이지
	@RequestMapping("Organization.do")
	public String organization() {
		return "HR_management/Organization";
	}

	// 인사관리 > 계정 관리 페이지
	@RequestMapping(value = "EmployeeAccount.do", method = RequestMethod.GET)
	public String employeeAccount(Model model, Criteria cri) {
		System.out.println("cri 값 초기화 전" + cri);
		cri.setCriteria("empinfo", "empno", "desc");
		System.out.println("cri 값 초기화 후" + cri);

		int totalCount = pagingService.getListCount(cri);
		Pagination pagination = new Pagination(cri, totalCount);

		List<Map<String, Object>> result = pagingService.getList(cri);
		System.out.println("[result] : " + result);

		model.addAttribute("list", result);
		model.addAttribute("pagination", pagination);
		model.addAttribute("criteria", cri);

		return "HR_management/EmployeeAccount";
	}

	// 인사관리 > 계정 관리 > 엑셀 다운로드
	@RequestMapping(value = "EmpTableToExcel.do")
	public String downloadExcel(Model model, Criteria cri) {
		cri.setCriteria("empinfo", "empno", "asc");
		cri.setPerPageNum(99);
		List<Map<String, Object>> list = pagingService.getList(cri);
		model.addAttribute("list", list);
		System.out.println("엑셀다운로드");
		System.out.println(list);
		return "empTableToExcel";
	}

	// 인사관리 > 계정 관리 > 사원 신규 등록
	@RequestMapping(value = "EmployeeAccount.do")
	public String insertNewAccount(Emp emp) {

		// 확인
		System.out.println(
				"==================================비밀번호 확인!! : 사번 - " + emp.getEmpNo() + "/ 비밀번호 - " + emp.getPwd());

		// 비밀번호 암호화하여 INSERT
		emp.setPwd(this.bCryptPasswordEncoder.encode(emp.getPwd()));

		// 암호화 확인
		System.out.println("==================================비밀번호 암호화 확인 : " + emp.getPwd());

		service.insertNewEmp(emp);
		return "HR_management/EmployeeAccount";
	}

	// 인사관리 > 계정 관리 > 사원 신규 등록 시 사번 중복 검증
	@RequestMapping(value = "checkEmpNo.do", method = RequestMethod.POST)
	@ResponseBody
	public Emp checkEmpNo(String empNo) {
		Emp dto = service.checkEmpNo(empNo);
		return dto;
	}

	// 인사관리 > 계정 관리 > 사원 신규 등록 시 AJAx 본부 테이블 가져오기
	@RequestMapping(value = "getHead.do", method = RequestMethod.POST)
	@ResponseBody
	public List<Head> getHeadQuarters() {
		List<Head> HQList = service.getHeadQuarters();
		return HQList;
	}

	// 인사관리 > 계정 관리 > 사원 신규 등록 > 본부 선택 시 해당 본부의 부서 AJAx 가져오기
	@RequestMapping(value = "getDept.do", method = RequestMethod.POST)
	@ResponseBody
	public List<Dept> getDepartments(String headCode) {
		List<Dept> deptList = service.getDepartments(headCode);
		return deptList;
	}

	// 인사관리 > 계정 관리 > 사원 신규 등록 > 직책(Position) 테이블 가져오기
	@RequestMapping(value = "getPosition.do", method = RequestMethod.POST)
	@ResponseBody
	public List<Position> getPositions() {
		List<Position> positionList = service.getPositions();
		return positionList;
	}

	// 인사관리 > 계정 관리 > 사원 신규 등록 > 직위(Class) 테이블 가져오기
	@RequestMapping(value = "getClass.do", method = RequestMethod.POST)
	@ResponseBody
	public List<com.olive.dto.Class> getClasses() {
		List<com.olive.dto.Class> classList = service.getClasses();
		return classList;
	}
	
	//인사관리 >> 근태관리 / 휴가관리
	@RequestMapping(value = "EmployeeAttendance.do", method = RequestMethod.GET)
	public String employeeAttendance(Model model, Criteria cri1, Criteria cri2) {
		
		cri1 =new Criteria();
		cri2 =new Criteria();
		//근태 테이블
		cri1.setCriteria("emp_att", "starttime", "desc");
		//휴가 테이블
		cri2.setCriteria("annual_diff", "startdate", "desc");
		int totalCount1 = pagingService.getListCount(cri1);
		int totalCount2 = pagingService.getListCount(cri2);
		Pagination pagination1 = new Pagination(cri1, totalCount1);
		Pagination pagination2 = new Pagination(cri2, totalCount2);
 
  		List<Map<String, Object>> result1 = pagingService.getList(cri1);
  		List<Map<String, Object>> result2 = pagingService.getList(cri2);
  		System.out.println("result1입니다.");
		System.out.println("[result1] : " + result1);
		System.out.println("result2입니다.");
		System.out.println("[result2] : " + result2);
		model.addAttribute("attendance", result1);
		model.addAttribute("annual", result2);
		model.addAttribute("pagination1", pagination1);
		model.addAttribute("pagination2", pagination2);
		model.addAttribute("criteria1", cri1);
		model.addAttribute("criteria2", cri2);
		System.out.println("휴가/근태관리");
		return "HR_management/EmployeeAttendance";
	}
}
