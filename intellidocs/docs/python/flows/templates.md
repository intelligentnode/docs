---
sidebar_position: 7
---

# Templates

Templates allow to merge the user instructions with inputs from previous step before executing the agent. By using templates, you can ensure that your agents receive inputs in a controlled flow.

### Writing Your Own Template

To create a custom template, your class should extend the `Template` abstract class and implement the `apply_input` and `apply_output` methods. While `apply_output` can be left unimplemented if not needed, `apply_input` is crucial for formatting the task input.

#### TextInputTemplate Example

The `TextInputTemplate` is a example for text-based inputs. 

```python
class TextInputTemplate(Template):

    def __init__(self, template_text: str, previous_input_tag='context', user_request_tag='user request'):
        # Ensure the template text includes placeholders for dynamic content
        if '{0}' not in template_text:
            context = previous_input_tag + ': {0}\n'
            request = user_request_tag + ': ' + template_text
            template_text = context + request

        self.template_text = template_text.strip()

    def apply_input(self, data):
        # Format the input data using the template
        return self.template_text.format(data)

    def apply_output(self, data):
        # This method can be left unimplemented if output manipulation is not required
        pass
```


### Example

Prepare the template instance.

```python
from intelli.flow.template.basic_template import TextInputTemplate

# define the template text
template_text = "Context: {0}\nuser request:"

# create an instance of TextInputTemplate
text_template = TextInputTemplate(template_text)
```

Initiate the Task

```python
from intelli.flow.tasks.task import Task
from intelli.flow.input.agent_input import TextAgentInput
from intelli.flow.agents.agent import Agent

# create the agent
text_agent = Agent(
    agent_type='text',
    provider='openai',
    mission='analyze sentiment',
    model_params={'key': 'YOUR_OPENAI_API_KEY', 'model': 'gpt-3'}
)

# create the task and pass the template
task = Task(task_input=TextAgentInput("This is a sample text."), agent=text_agent, template=text_template, log=True)
```



 
