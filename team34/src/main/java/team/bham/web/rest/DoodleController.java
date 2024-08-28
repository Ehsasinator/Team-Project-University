package team.bham.web.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import org.apache.logging.log4j.util.Chars;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/playervsai")
public class DoodleController {

    Integer num = 1;
    private static byte[] lastDoodleImageData = { 10, 20, 30, 40, 50 };

    // @GetMapping("/randomWord")
    // public ResponseEntity<String> getRandomWord() {
    //     // int index = (int) (Math.random() * words.size());
    //     int index = ThreadLocalRandom.current().nextInt(WordsAndPhrases.words.size()); // thread safe random number generator
    //     String word = WordsAndPhrases.words.get(index);
    //     return new ResponseEntity<>(word, HttpStatus.OK);
    // }
    @GetMapping("/randomWord")
    public ResponseEntity<String> getResult() {
        String word = runPythonScript(lastDoodleImageData);

        System.out.println(word);
        String word2 = runPythonScript(lastDoodleImageData);
        System.out.println(word2);
        System.out.println(lastDoodleImageData.toString());

        return new ResponseEntity<>(word2, HttpStatus.OK);
    }

    @GetMapping("/newWord")
    public ResponseEntity<String> getNewWord() {
        ArrayList<String> outClasses = new ArrayList<>();
        outClasses.add("windmill");
        outClasses.add("zebra");
        outClasses.add("zigzag");
        outClasses.add("airplane");
        outClasses.add("alarm-clock");
        outClasses.add("ambulance");
        outClasses.add("angel");
        outClasses.add("apple");
        outClasses.add("banana");
        outClasses.add("basketball");
        outClasses.add("bicycle");
        outClasses.add("bus");
        outClasses.add("butterfly");

        // Choose a random word
        String randomWord = chooseRandomWord(outClasses);

        return new ResponseEntity<>(randomWord, HttpStatus.OK);
    }

    private static String chooseRandomWord(ArrayList<String> wordList) {
        if (wordList.isEmpty()) {
            throw new IllegalArgumentException("Word list is empty");
        }

        Random random = new Random();
        int randomIndex = random.nextInt(wordList.size());
        return wordList.get(randomIndex);
    }

    @PostMapping("/savedoodle")
    public void saveDoodle(@RequestBody Map<String, String> imageDataMap) throws IOException {
        String base64Image = imageDataMap.get("data").split(",")[1];
        lastDoodleImageData = Base64.getDecoder().decode(base64Image);
        System.out.println("copy this");
        System.out.println(lastDoodleImageData);
    }

    public static String runPythonScript(byte[] imageData) {
        try {
            // // Specify the path to your Python interpreter and the Python script
            // String pythonInterpreter = "python3"; // or "python3" depending on your setup
            // String pythonScript = "src/app.py";

            // // Build the command to run the Python script
            // ProcessBuilder processBuilder = new ProcessBuilder(pythonInterpreter, pythonScript);

            // // Redirect the standard output and error streams
            // processBuilder.redirectErrorStream(true);

            // // Start the process
            // Process process = processBuilder.start();
            // ArrayList<String> results = new ArrayList<String>();
            // // Read and print the output of the Python script
            // try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            //     String line;
            //     while ((line = reader.readLine()) != null) {
            //         results.add(line);
            //     }

            //     String prediction = results.get(3);
            //     String zebraValue = extractValueByKey(prediction, "0");
            //     System.out.println(zebraValue);
            //     return zebraValue;
            // }
            String url = "http://ai-model:1234/api/infer"; // CHANGE THIS TO http://ai-model:1234/api/infer for the vm version
            String charset = "UTF-8";

            String boundary = Long.toHexString(System.currentTimeMillis()); // Just generate some unique random value.
            String CRLF = "\r\n"; // Line separator required by multipart/form-data.

            URLConnection connection = new URL(url).openConnection();
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (
                OutputStream output = connection.getOutputStream();
                BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(output, Charset.defaultCharset()));
            ) {
                // Send binary file.
                writer.append("--" + boundary).append(CRLF);
                writer.append("Content-Disposition: form-data; name=\"binaryFile\"; filename=\"image.png\"").append(CRLF);
                writer.append("Content-Type: image/png").append(CRLF);
                writer.append("Content-Transfer-Encoding: binary").append(CRLF);
                writer.append(CRLF).flush();
                output.write(imageData);
                output.flush(); // Important before continuing with writer!
                writer.append(CRLF).flush(); // CRLF is important! It indicates end of boundary.

                // End of multipart/form-data.
                writer.append("--" + boundary + "--").append(CRLF).flush();
            }

            // Request is lazily fired whenever you need to obtain information about response.
            int responseCode = ((HttpURLConnection) connection).getResponseCode();
            System.out.println(responseCode); // Should be 200
            BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line + "\n");
            }
            br.close();
            String input = sb.toString();
            int colonIndex = input.indexOf(':');
            int lastQuoteIndex = input.lastIndexOf('"');

            // Extract the substring between the colon and the last quote
            String value = input.substring(colonIndex + 2, lastQuoteIndex);
            // Wait for the process to finish
            return value;
        } catch (IOException e) {
            e.printStackTrace();
            return "didnt work";
        }
    }

    private static String extractValueByKey(String jsonString, String key) {
        try {
            // Parse the JSON string
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonString);

            // Extract the value associated with the specified key
            return jsonNode.get(key).asText();
        } catch (IOException e) {
            e.printStackTrace();
            return null; // Handle the exception appropriately in your code
        }
    }
}
