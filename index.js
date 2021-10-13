"use strict";
let count = 0,
  ucount = 0;
let save = 0;
let imageUpload = document.getElementById("upload");
let image;
let canvas;
const labels = [
  "Abhishek",
  "Akshat",
  "Ayush",
  "Divyanshu",
  "Ocean",
  "Pancham",
  "Piyush",
  "Pranshul",
  "Rohit",
];
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(start);

async function start() {
  const container = document.getElementById("photo");
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

  document.getElementById("photo").innerHTML = "<h2>Now Upload</h2>";
  imageUpload.addEventListener("change", async () => {
    document.getElementById("photo").innerHTML = null;
    if (image) image.remove();
    if (canvas) canvas.remove();
    image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);
    image.style =
      "max-height: 35vh; max-width: 80vh;position : absolute; top:48px; left:0;";
    canvas = faceapi.createCanvasFromMedia(image);
    canvas.style =
      "max-height: 35vh; max-width: 80vh; position : absolute; top:48px; left:0;object-fit:contain";
    container.append(canvas);
    document.getElementById("btn-txt").innerHTML = "Upload Another";
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) =>
      faceMatcher.findBestMatch(d.descriptor)
    );

    results.forEach((result, i) => {
      if (
        document
          .getElementById("Attendees")
          .innerText.toString()
          .includes(result.label) == false
      ) {
        document.getElementById(
          "Attendees"
        ).innerHTML += `<li>${result.label}</li>`;
        count++;
      }

      if (result.label === "unknown") ucount++;

      console.log(result.label);
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result.toString(),
      });
      drawBox.draw(canvas);
    });
    for (let i = 0; i < 9; i++) {
      if (
        document
          .getElementById("Attendees")
          .innerText.toString()
          .includes(labels[i]) == false
      ) {
        document.getElementById("Absent").innerHTML += `<li>${labels[i]}</li>`;
      }
    }
    document.getElementById("attendees").innerHTML = `Attendees : ${
      count - ucount
    } & unknown : ${ucount}`;
    document.getElementById("absent").innerHTML = `Absent : ${9 - count} `;
  });
}

function loadLabeledImages() {
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(
          `https://raw.githubusercontent.com/yashkumarkalyan/aitendance/main/labeled_images/${label}/${i}.jpg`
        );
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
