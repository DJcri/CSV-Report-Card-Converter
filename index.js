const fs = require("fs");
const csv = require("csvtojson");

function getArraySum(arr) {
  const sum = arr.reduce((a, b) => {
    return Number(a) + Number(b);
  }, 0);

  return sum;
}

async function makeReportCard(
  courses_file = process.argv[2],
  students_file = process.argv[3],
  tests_file = process.argv[4],
  marks_file = process.argv[5],
  output_file = process.argv[6]
) {
  const courses = await csv().fromFile(`${process.cwd()}/${courses_file}`);
  const students = await csv().fromFile(`${process.cwd()}/${students_file}`);
  const tests = await csv().fromFile(`${process.cwd()}/${tests_file}`);
  const marks = await csv().fromFile(`${process.cwd()}/${marks_file}`);

  let err = { error: "" };

  const output = {
    students: [],
  };

  students.forEach((student) => {
    const data = {
      id: student.id,
      name: student.name,
      totalAverage: 0,
      courses: [],
    };

    const course_avgs = [];
    const course_storage = {};

    marks.filter((mark) => {
      if (mark.student_id === student.id) {
        const test = tests.filter((test) => {
          if (test.id === mark.test_id) {
            return test;
          }
        })[0];

        if (course_storage[test.course_id]) {
          course_storage[test.course_id] = [
            ...course_storage[test.course_id],
            [mark.mark, test.weight * 0.01],
          ];
        } else {
          const course = courses.filter((course) => {
            if (course.id === test.course_id) {
              return course;
            }
          })[0];

          course_storage[course.id] = [[mark.mark, test.weight * 0.01]];

          data.courses.push({
            id: course.id,
            name: course.name,
            teacher: course.teacher,
            courseAverage: 0,
          });
        }

        return mark;
      }
    });

    for (const [id, mark_tuples] of Object.entries(course_storage)) {
      const weighted_marks = [];
      const weights = [];

      mark_tuples.forEach((tuple) => {
        const [mark, weight] = tuple;
        weighted_marks.push(mark * weight);
        weights.push(weight);
      });

      const weight_sum = getArraySum(weights);
      const weighted_marks_sum = getArraySum(weighted_marks);

      if (weight_sum !== 1) {
        err.error = "Invalid course weights";
        return;
      }

      data.courses.map((course) => {
        if (course.id === id) {
          const course_avg = (weighted_marks_sum / weight_sum).toFixed(2);

          course.courseAverage = course_avg;

          course_avgs.push(course_avg);
        }
      });
    }

    if (!err.error) {
      data.totalAverage = (
        getArraySum(course_avgs) / data.courses.length
      ).toFixed(2);

      output.students.push(data);
    }
  });

  if (!err.error) {
    fs.writeFileSync(`${process.cwd()}/${output_file}`, JSON.stringify(output));
    return output;
  } else {
    fs.writeFileSync(`${process.cwd()}/${output_file}`, JSON.stringify(err));
    return err;
  }
}

makeReportCard();

module.exports = [makeReportCard, getArraySum];
