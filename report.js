const write_report = document.getElementById('write_report');
const latest_report = document.getElementById('latest_report');
const write_report_content = document.getElementById('write_report_content');
const latest_report_content = document.getElementById('latest_report_content');
const category_filter = document.getElementById('category_filter');

write_report.addEventListener('click',()=>{
    write_report.style.background="#D9D9D9";
    latest_report.style.background="#F9F9F9";
    write_report_content.style.display='block';
    latest_report_content.style.display='none';
    category_filter.style.display='none';
});
latest_report.addEventListener('click',()=>{
    write_report.style.background='#F9F9F9';
    latest_report.style.background="#D9D9D9";
    latest_report_content.style.display='block';
    write_report_content.style.display='none';
    category_filter.style.display='flex';
});

write_report.click();