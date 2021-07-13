const { expect } = require("chai");
const [makeReportCard, getArraySum] = require("../index.js");

const courses_file = "test/courses.csv";
const students_file = "test/students.csv";
const tests_file = "test/tests.csv";
const tests_wrong_weight_file = "test/tests_wrong_weight.csv";
const marks_file = "test/marks.csv";
const output_file = "test/output.json";

describe("makes report card", () => {
  it("getArraySum returns the correct sum", () => {
    const sum = getArraySum([1, 2, 3]);

    expect(sum).to.deep.equal(6);
  });

  it("output has correct values", async () => {
    const output = await makeReportCard(
      courses_file,
      students_file,
      tests_file,
      marks_file,
      output_file
    );

    const first_student = output.students[0];
    const first_course = first_student.courses[0];

    expect(output).to.exist;
    expect(Number(first_student.totalAverage)).to.deep.equal(72.03);
    expect(Number(first_course.courseAverage)).to.deep.equal(90.1);
  });

  it("checks if weights add up to 100", async () => {
    const output = await makeReportCard(
      courses_file,
      students_file,
      tests_wrong_weight_file,
      marks_file,
      output_file
    );

    const error = output.error;

    expect(error).to.exist;
    expect(error).to.deep.equal("Invalid course weights");
  });
});
