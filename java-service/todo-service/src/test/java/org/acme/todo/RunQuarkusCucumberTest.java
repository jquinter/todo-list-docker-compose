package org.acme.todo;

// import io.quarkus.test.junit.TestProfile;
import io.cucumber.junit.platform.engine.Constants;
import io.quarkus.test.junit.QuarkusTest; // Keep this for Quarkus test context
import io.quarkiverse.cucumber.CucumberOptions; // Keep if using features/glue directly
import io.quarkiverse.cucumber.CucumberQuarkusTest; // This is your chosen runner base class
import io.quarkus.test.junit.mockito.InjectMock;

// REMOVE ALL JUnit Platform Suite imports as they conflict:
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.ConfigurationParameter;

// REMOVE THESE STATIC IMPORTS as they are for JUnit Platform's Constants
// import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
// import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

// REMOVE THESE CONFLICTING ANNOTATIONS IF EXTENDING CucumberQuarkusTest
// @SelectClasspathResource("/src/test/resources/org/acme/todo/todo.feature")
// @ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "org.acme.todo")
// @ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, summary, html:target/cucumber-report.html")
// @TestHTTPEndpoint(TodoResource.class) // Uncomment if you want to target a specific endpoint
@Suite
@IncludeEngines("cucumber")
@ConfigurationParameter(key = Constants.GLUE_PROPERTY_NAME, value = "org.acme.todo")
@QuarkusTest // Essential for Quarkus test environment
@CucumberOptions(
    glue = { "org.acme.todo" }, // Points to your step definition package
    features = "src/test/resources/org/acme/todo/" // Points to your feature file directory
    // Add plugins if you want specific output formats here, e.g.,
    // plugin = { "pretty", "summary", "html:target/cucumber-report.html" }
)
public class RunQuarkusCucumberTest extends CucumberQuarkusTest {
    // This is where Quarkus will inject the mock
    @InjectMock
    TodoService todoServiceMock;

    // Static field to hold the mock for access from TodoSteps
    public static TodoService STATIC_TODO_SERVICE_MOCK;

    // Constructor to capture the injected mock
    public RunQuarkusCucumberTest() {
        // When this test class is instantiated by Quarkus, capture the mock
        // This is called before any @BeforeAll or @BeforeEach by JUnit 5 / Quarkus
        STATIC_TODO_SERVICE_MOCK = todoServiceMock;
    }

    // You might also use a @BeforeAll hook if you prefer, but constructor is reliable for static setup
    // @BeforeAll // Requires JUnit Jupiter's @BeforeAll to be static
    // public static void setupStaticMock(@InjectMock TodoService mock) { // This specific injection into static method needs QuarkusTest.
    //     STATIC_TODO_SERVICE_MOCK = mock;
    // }    

    // public static void main(String[] args) {
    //     runMain(RunQuarkusCucumberTest.class, args);
    // }    
}